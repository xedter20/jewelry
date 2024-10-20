import express from 'express';

import { authenticateUserMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();
import config from '../../config.js';

const { mySqlDriver } = config;

import multer from 'multer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
let firebaseStorage = config.firebaseStorage;

const upload = multer({ storage: multer.memoryStorage() });

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
  const {
    Category,
    CustomerID,
    Due_Date,
    Facebook,
    Grams,
    ItemName,
    MonthsToPay,
    Price,
    Start_Date,
    SupplierID,
    Downpayment
  } = req.body;

  console.log({
    Category,
    CustomerID,
    Due_Date,
    Facebook,
    Grams,
    ItemName,
    MonthsToPay,
    Price,
    Start_Date,
    SupplierID
  });

  try {
    let [results] = await mySqlDriver.execute(`
      SELECT COUNT(*) AS count FROM layaway
      `);

    const rowIndex = results[0].count + 1; // Increment row index by 1
    const OrderID = createID(formatDate(), rowIndex);
    let loggedInUser = req.user;

    console.log({ OrderID });

    const queryText = `INSERT INTO layaway 
    (
    LayawayID ,
    OrderID,
    Category, CustomerID, Due_Date,  Grams, ItemName, MonthsToPay, 
    Price, Start_Date, SupplierID ,
    Admin_Fname,
    Downpayment
    
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ? ,?)`;
    const values = [
      OrderID,
      OrderID,
      Category,
      CustomerID,
      Due_Date,
      Grams,
      ItemName,
      MonthsToPay,
      Price,
      Start_Date,
      SupplierID,
      loggedInUser.EmployeeID,
      Downpayment
    ];

    const queryPaymentText = `INSERT INTO payments 
    (
      layAwayID, customer_id, amount, payment_method, status
    
    ) VALUES (?, ?, ?, ? ,?)`;
    const paymentValues = [
      OrderID,
      CustomerID,
      Downpayment,
      '',
      'PARTIALLY_PAID'
    ];

    let result = await mySqlDriver.query(queryText, values, (err, result) => {
      return result;
    });

    await mySqlDriver.query(queryPaymentText, paymentValues);
    res
      .status(201)
      .json({ message: 'Record created successfully', id: result.insertId });
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
    layaway.LayawayID,
    layaway.OrderID,
    layaway.Category,
    layaway.Due_Date,
    layaway.Grams,
    layaway.ItemName,
    layaway.MonthsToPay,
    layaway.Price,
    layaway.Start_Date,
    layaway.status,
    layaway.Downpayment,
    supplier.SupplierID,
    supplier.SupplierName AS SupplierName,
    SUM(payments.amount) AS totalPaidAmount,
    customer_record.CustomerID,
    customer_record.CustomerName AS CustomerName
FROM 
    layaway
INNER JOIN 
    supplier ON layaway.SupplierID = supplier.SupplierID
INNER JOIN 
    customer_record ON layaway.CustomerID = customer_record.CustomerID
INNER JOIN 
    payments ON payments.layAwayID = layaway.LayawayID
GROUP BY 
    layaway.LayawayID,
    layaway.OrderID,
    layaway.Category,
    layaway.Due_Date,
    layaway.Grams,
    layaway.ItemName,
    layaway.MonthsToPay,
    layaway.Price,
    layaway.Start_Date,
    layaway.status,
    layaway.Downpayment,
    supplier.SupplierID,
    supplier.SupplierName,
    customer_record.CustomerID,
    customer_record.CustomerName;




      `);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/payment/list', async (req, res) => {
  try {
    let LayawayID = req.body.LayawayID;

    console.log({ LayawayID });
    const [orders] = await mySqlDriver.execute(`
      
    SELECT * from payments


    where LayawayID = '${LayawayID}'

    ORDER BY payment_date ASC



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

router.post(
  '/makePayment',
  upload.single('Proof_Payment'),
  async (req, res) => {
    try {
      const file = req.file;

      console.log({ file });

      let { layAwayID, customer_id, amount, payment_method, status } = req.body;

      const storageRef = ref(
        firebaseStorage,
        `layaway/${layAwayID}/prof_of_payment/${file.originalname}`
      );
      const metadata = { contentType: file.mimetype };

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file.buffer, metadata);

      // Get the file's download URL
      const downloadURL = await getDownloadURL(storageRef);

      const queryPaymentText = `INSERT INTO payments 
    (
      layAwayID, customer_id, amount, payment_method,
      proof_of_payment,
      status
    
    ) VALUES (?, ?, ?, ?,?,?)`;
      const paymentValues = [
        layAwayID,
        customer_id,
        amount,
        payment_method,
        downloadURL,
        status
      ];

      await mySqlDriver.query(queryPaymentText, paymentValues);

      const queryUpdateLayAway = `UPDATE layaway SET status = ? 
      
      where  LayawayID  = ?
      
      `;
      const values = [status, layAwayID];

      await mySqlDriver.query(queryUpdateLayAway, values);

      // await mySqlDriver.execute(
      //   updateOrder(transactionId, 'PAID', downloadURL)
      // );

      res.status(200).json({ downloadURL });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/generate/report', async (req, res) => {
  const { startDate, endDate } = req.query;
  console.log({ startDate, endDate });

  const [rows] = await mySqlDriver.query(
    `SELECT Date_Modified, SUM(Amount_Paid) AS TotalPaid FROM layaway WHERE Date_Modified BETWEEN ? AND ? GROUP BY Date_Modified`,
    [startDate, endDate]
  );

  res.json(rows);
});

export default router;
