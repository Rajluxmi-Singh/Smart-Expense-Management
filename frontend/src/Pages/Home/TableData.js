import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";
import { deleteTransactions, editTransactions } from "../../utils/ApiRequest";

const TableData = (props) => {
  const [show, setShow] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setEditingTransaction(null);
    setValues({
      title: "",
      amount: "",
      description: "",
      category: "",
      date: "",
      transactionType: "",
    });
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleEditClick = (itemId) => {
    const editTran = transactions.find((item) => item._id === itemId);
    if (editTran) {
      setEditingTransaction(editTran);
      setCurrId(itemId);
      handleShow();
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedValues = { ...values, transactionId: currId };
      const { data } = await editTransactions(updatedValues);

      if (data.success === true) {
        const updatedTransactions = transactions.map((item) =>
          item._id === currId ? { ...item, ...values } : item
        );
        setTransactions(updatedTransactions);
        handleClose();
      } else {
        console.error("Failed to update transaction");
      }
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  const handleDeleteClick = async (itemId) => {
    if (!props.user || !props.user._id) {
      console.error("User not found");
      return;
    }

    try {
      const { data } = await deleteTransactions({
        transactionId: itemId,
        userId: props.user._id,
      });

      if (data.success === true) {
        const updatedList = transactions.filter((item) => item._id !== itemId);
        setTransactions(updatedList);
      } else {
        console.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    setTransactions(props.data);
  }, [props.data]);

  return (
    <>
      <Container>
        <Table responsive="md" className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {transactions.map((item, index) => (
              <tr key={index}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>{item.amount}</td>
                <td>{item.transactionType}</td>
                <td>{item.category}</td>
                <td>
                  <div className="icons-handle">
                    <EditNoteIcon
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleEditClick(item._id)}
                    />
                    <DeleteForeverIcon
                      sx={{ color: "red", cursor: "pointer", marginLeft: "10px" }}
                      onClick={() => handleDeleteClick(item._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      {/* Modal for Editing */}
      {editingTransaction && (
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Transaction Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  type="text"
                  placeholder={editingTransaction.title}
                  value={values.title}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  name="amount"
                  type="number"
                  placeholder={editingTransaction.amount}
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
                  <option value="">{editingTransaction.category}</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Tip">Tip</option>
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
                  name="description"
                  type="text"
                  placeholder={editingTransaction.description}
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
                  <option value={editingTransaction.transactionType}>
                    {editingTransaction.transactionType}
                  </option>
                  <option value="Credit">Credit</option>
                  <option value="Expense">Expense</option>
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleEditSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default TableData;
