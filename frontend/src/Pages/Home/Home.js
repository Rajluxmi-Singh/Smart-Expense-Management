import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";
import {
  addTransactionAPI,
  getTransactionAPI,
} from "../../utils/ApiRequest";
import "./home.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastOptions = {
  position: "bottom-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  theme: "dark",
};

const Home = () => {
  const navigate = useNavigate();
  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const checkUser = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return navigate("/login");
      setcUser(user);
      setRefresh(true);
    };
    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => setFrequency(e.target.value);
  const handleSetType = (e) => setType(e.target.value);
  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, amount, description, category, date, transactionType } = values;
    if (!title || !amount || !description || !category || !date || !transactionType) {
      return toast.error("Please enter all the fields", toastOptions);
    }

    setLoading(true);
    try {
      const { data } = await addTransactionAPI({
        title,
        amount,
        description,
        category,
        date,
        transactionType,
        userId: cUser._id,
      });

      if (data.success) {
        toast.success(data.message, toastOptions);
        handleClose();
        setRefresh(!refresh);
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error("Server Error", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllTransactions = async () => {
      if (!cUser) return;
      setLoading(true);
      try {
        const { data } = await getTransactionAPI({
          userId: cUser._id,
          frequency,
          startDate,
          endDate,
          type,
        });
        setTransactions(data.transactions);
      } catch (err) {
        toast.error("Failed to fetch transactions", toastOptions);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
  };

  // 🔁 Predict categories for all transactions
  const predictCategories = async () => {
    try {
      const updatedTransactions = await Promise.all(transactions.map(async (txn) => {
        if (!txn.title) return { ...txn, category: "Unknown" };

        const response = await fetch("http://localhost:5001/api/expenses/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: txn.title }),
        });

        if (!response.ok) {
          console.error(`Prediction failed for ${txn.title}`);
          return { ...txn, category: "Prediction Failed" };
        }

        const data = await response.json();
        return { ...txn, category: data.category };
      }));

      setTransactions(updatedTransactions);
      toast.success("Categories updated!", toastOptions);
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Prediction failed", toastOptions);
    }
  };

  return (
    <>
      <Header />

      {loading ? (
        <Spinner />
      ) : (
        <Container className="mt-3">
          <div className="filterRow">
            <div className="text-white">
              <Form.Group className="mb-3">
                <Form.Label>Select Frequency</Form.Label>
                <Form.Select value={frequency} onChange={handleChangeFrequency}>
                  <option value="7">Last Week</option>
                  <option value="30">Last Month</option>
                  <option value="365">Last Year</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="text-white type">
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select value={type} onChange={handleSetType}>
                  <option value="all">All</option>
                  <option value="expense">Expense</option>
                  <option value="credit">Earned</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="text-white iconBtnBox">
              <FormatListBulletedIcon
                onClick={() => setView("table")}
                className={view === "table" ? "iconActive" : "iconDeactive"}
              />
              <BarChartIcon
                onClick={() => setView("chart")}
                className={view === "chart" ? "iconActive" : "iconDeactive"}
              />
            </div>

            <div>
              <Button onClick={handleShow} className="addNew">Add New</Button>
              <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Add Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        name="title"
                        type="text"
                        placeholder="Enter Transaction Name"
                        value={values.title}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        name="amount"
                        type="number"
                        placeholder="Enter Amount"
                        value={values.amount}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                      >
                        <option value="">Choose...</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Rent">Rent</option>
                        <option value="Salary">Salary</option>
                        <option value="Food">Food</option>
                        <option value="Medical">Medical</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        placeholder="Enter Description"
                        value={values.description}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Transaction Type</Form.Label>
                      <Form.Select
                        name="transactionType"
                        value={values.transactionType}
                        onChange={handleChange}
                      >
                        <option value="">Choose...</option>
                        <option value="credit">Credit</option>
                        <option value="expense">Expense</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={values.date}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleClose}>Close</Button>
                      <Button type="submit" variant="primary">Submit</Button>
                    </Modal.Footer>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>
          </div>

          {frequency === "custom" && (
            <div className="date">
              <div className="form-group">
                <label className="text-white">Start Date:</label>
                <DatePicker selected={startDate} onChange={handleStartChange} />
              </div>
              <div className="form-group">
                <label className="text-white">End Date:</label>
                <DatePicker selected={endDate} onChange={handleEndChange} minDate={startDate} />
              </div>
            </div>
          )}

          <div className="containerBtn">
            <Button variant="primary" onClick={handleReset}>Reset Filter</Button>
            <Button variant="success" onClick={predictCategories} className="ms-2">Predict Category</Button>
          </div>

          {view === "table" ? (
            <TableData data={transactions} user={cUser} />
          ) : (
            <Analytics transactions={transactions} user={cUser} />
          )}

          <ToastContainer />
        </Container>
      )}
    </>
  );
};

export default Home;
