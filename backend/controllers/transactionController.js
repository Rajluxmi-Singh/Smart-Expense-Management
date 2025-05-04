import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";
import axios from "axios"; // 🔥 Add this to call Flask ML API

export const addTransactionController = async (req, res) => {
  try {
    let {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
    } = req.body;

    if (
      !title ||
      !amount ||
      !description ||
      !date ||
      !transactionType
    ) {
      return res.status(408).json({
        success: false,
        messages: "Please fill all fields",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 Predict category using ML if not given
    if (!category) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/predict-category", {
          title: title,
        });
        category = response.data.category;
      } catch (mlError) {
        console.error("ML Prediction failed:", mlError.message);
        return res.status(500).json({
          success: false,
          message: "ML prediction failed",
        });
      }
    }

    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
    });

    user.transactions.push(newTransaction);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction Added Successfully",
      transaction: newTransaction,
    });

  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const query = {
      user: userId,
    };

    if (type !== 'all') {
      query.transactionType = type;
    }

    if (frequency !== 'custom') {
      query.date = {
        $gt: moment().subtract(Number(frequency), "days").toDate()
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate(),
      };
    }

    const transactions = await Transaction.find(query);

    return res.status(200).json({
      success: true,
      transactions: transactions,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const transactionElement = await Transaction.findByIdAndDelete(transactionId);
    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    user.transactions = user.transactions.filter(
      (transaction) => transaction._id.toString() !== transactionId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Transaction successfully deleted`,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};

export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, description, date, category, transactionType } = req.body;

    const transactionElement = await Transaction.findById(transactionId);
    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (title) transactionElement.title = title;
    if (description) transactionElement.description = description;
    if (amount) transactionElement.amount = amount;
    if (category) transactionElement.category = category;
    if (transactionType) transactionElement.transactionType = transactionType;
    if (date) transactionElement.date = date;

    await transactionElement.save();

    return res.status(200).json({
      success: true,
      message: `Transaction Updated Successfully`,
      transaction: transactionElement,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      messages: err.message,
    });
  }
};
