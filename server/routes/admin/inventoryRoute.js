import express from 'express';

import {
  addOrder,
  listOrder,
  makePayment
} from '../../controllers/transactionController.js';

import { authenticateUserMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();
import config from '../../config.js';

const { mySqlDriver } = config;
import { adminupdateOrder } from '../../cypher/order.js';

// Create a new order
function createID(datePart, rowIndex) {
  const dateFormatted = datePart.split('/').join('');
  const formattedIndex = String(rowIndex).padStart(2, '0'); // Ensure two digits
  const id = dateFormatted + formattedIndex;
  return id;
}
function formatDate() {
  const date = new Date(); // Get the current date
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
  let day = date.getDate().toString().padStart(2, '0');
  let year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year

  return `${month}/${day}/${year}`;
}

router.post('/create', authenticateUserMiddleware, async (req, res) => {
  let {
    SupplierID,
    Grams,
    Category,
    Price,
    Amount,
    Date,
    ModifiedBy,
    DateModified
  } = req.body;
  try {
    let [results] = await mySqlDriver.execute(`
      SELECT COUNT(*) AS count FROM inventory
      `);

    const rowIndex = results[0].count + 1; // Increment row index by 1
    const OrderID = createID(formatDate(), rowIndex);
    let loggedInUser = req.user;

    const [result] = await mySqlDriver.execute(
      `INSERT INTO inventory (OrderID, SupplierID, Grams, Category, Price, Amount, Date, ModifiedBy, DateModified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        OrderID,
        SupplierID,
        Grams,
        Category,
        Price,
        Amount,
        Date,
        loggedInUser.EmployeeID,
        Date
      ]
    );
    res
      .status(201)
      .json({ message: 'Order created', orderId: result.insertId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.post('/list', async (req, res) => {
  try {
    let SupplierID = req.body.SupplierID;

    console.log({ SupplierID });
    const [orders] = await mySqlDriver.execute(`
      
      SELECT 
    o.OrderID,
    o.SupplierID,
    s.SupplierName,
    s.PhoneNo,
    s.Email,
    s.Admin_Fname,
    o.Grams,
    o.Category,
    o.Price,
    o.Amount,
    o.Date,
    o.ModifiedBy,
    o.DateModified
FROM inventory o


INNER JOIN supplier s ON o.SupplierID = s.SupplierID

${SupplierID ? `WHERE o.SupplierID = '${SupplierID}'` : ''}


      `);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific order by ID
router.get('/:id', async (req, res) => {
  try {
    const [order] = await mySqlDriver.execute(
      'SELECT * FROM Orders WHERE OrderID = ?',
      [req.params.id]
    );
    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an order
router.put('/:OrderID', authenticateUserMiddleware, async (req, res) => {
  const {
    SupplierID,
    Grams,
    Category,
    Price,
    Amount,
    Date,
    ModifiedBy,
    DateModified
  } = req.body;
  let loggedInUser = req.user;
  let OrderID = req.params.OrderID;

  try {
    const [result] = await mySqlDriver.execute(
      `UPDATE inventory 
      SET 
      SupplierID = ?,
      Grams = ?, 
      Category = ?, 
      Price = ?, 
      Amount = ?, 
      Date = ?, 
      ModifiedBy = ?
      WHERE OrderID = ?
      
      `,
      [
        SupplierID,
        Grams,
        Category,
        Price,
        Amount,
        Date,
        loggedInUser.EmployeeID,
        OrderID
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order updated' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await mySqlDriver.execute(
      'DELETE FROM Orders WHERE OrderID = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
