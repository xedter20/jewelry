import express from 'express';
import config from '../../config.js';

const router = express.Router();
const { mySqlDriver } = config;

// Create a new pricing record
router.post('/pricing', async (req, res) => {
  const {
    Base_Price_Brand_New,
    Amount_Per_Gram_Brand_New,
    Base_Price_Subasta,
    Amount_Per_Gram_Subasta
  } = req.body;

  // Basic validation
  if (
    Base_Price_Brand_New == null ||
    Amount_Per_Gram_Brand_New == null ||
    Base_Price_Subasta == null ||
    Amount_Per_Gram_Subasta == null
  ) {
    return res
      .status(400)
      .json({ success: false, error: 'All fields are required.' });
  }

  const sql = `INSERT INTO pricing (Base_Price_Brand_New, Amount_Per_Gram_Brand_New, Base_Price_Subasta, Amount_Per_Gram_Subasta)
               VALUES (?, ?, ?, ?)`;

  try {
    const [result] = await mySqlDriver.execute(sql, [
      Base_Price_Brand_New,
      Amount_Per_Gram_Brand_New,
      Base_Price_Subasta,
      Amount_Per_Gram_Subasta
    ]);
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error(error); // Log error for debugging
    res
      .status(500)
      .json({
        success: false,
        error: 'An error occurred while creating the pricing record.'
      });
  }
});

// Read all pricing records
router.get('/pricing', async (req, res) => {
  const sql = 'SELECT * FROM pricing';

  try {
    const [results] = await mySqlDriver.execute(sql);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error(error); // Log error for debugging
    res
      .status(500)
      .json({
        success: false,
        error: 'An error occurred while retrieving pricing records.'
      });
  }
});

// Read a single pricing record
router.get('/pricing/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM pricing WHERE id = ?';

  try {
    const [results] = await mySqlDriver.execute(sql, [id]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Pricing record not found' });
    }
    res.json({ success: true, data: results[0] });
  } catch (error) {
    console.error(error); // Log error for debugging
    res
      .status(500)
      .json({
        success: false,
        error: 'An error occurred while retrieving the pricing record.'
      });
  }
});

// Update a pricing record
router.put('/pricing/:id', async (req, res) => {
  const { id } = req.params;
  const {
    Base_Price_Brand_New,
    Amount_Per_Gram_Brand_New,
    Base_Price_Subasta,
    Amount_Per_Gram_Subasta
  } = req.body;

  const sql = `UPDATE pricing SET 
                Base_Price_Brand_New = ?, 
                Amount_Per_Gram_Brand_New = ?, 
                Base_Price_Subasta = ?, 
                Amount_Per_Gram_Subasta = ? 
              WHERE id = ?`;

  try {
    const [result] = await mySqlDriver.execute(sql, [
      Base_Price_Brand_New,
      Amount_Per_Gram_Brand_New,
      Base_Price_Subasta,
      Amount_Per_Gram_Subasta,
      id
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Pricing record not found' });
    }
    res.json({ success: true, message: 'Pricing record updated successfully' });
  } catch (error) {
    console.error(error); // Log error for debugging
    res
      .status(500)
      .json({
        success: false,
        error: 'An error occurred while updating the pricing record.'
      });
  }
});

// Delete a pricing record
router.delete('/pricing/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM pricing WHERE id = ?';

  try {
    const [result] = await mySqlDriver.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Pricing record not found' });
    }
    res.json({ success: true, message: 'Pricing record deleted successfully' });
  } catch (error) {
    console.error(error); // Log error for debugging
    res
      .status(500)
      .json({
        success: false,
        error: 'An error occurred while deleting the pricing record.'
      });
  }
});

export default router;
