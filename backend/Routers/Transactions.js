import express from 'express';
import {
  addTransactionController,
  deleteTransactionController,
  getAllTransactionController,
  updateTransactionController,
} from '../controllers/transactionController.js';

const router = express.Router();

// 🔁 Get all transactions (GET and POST supported)
router
  .route("/getTransaction")
  .post(getAllTransactionController)  // for filters in body
  .get(getAllTransactionController); // optional GET (if you pass userId in query or handle it accordingly)

// ➕ Add a transaction
router.route("/addTransaction").post(addTransactionController);

// ❌ Delete a transaction
router.route("/deleteTransaction/:id").post(deleteTransactionController);

// ✏️ Update a transaction
router.route("/updateTransaction/:id").put(updateTransactionController);

export default router;
