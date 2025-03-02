import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/axiosConfig";
import "../CSS/NewItem.css";

const NewItemForm = () => {
  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [isSellerOrAdmin, setIsSellerOrAdmin] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    let { name, value } = e.target;
      if (name === "price" && value < 0) {
      alert("Price cannot be negative");
    return;
  }
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiClient.post("/shop/items/", itemData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    .then(() => {
      alert("Item added successfully!");
      setItemData({
      title: "",
      description: "",
      price: "",
    });
    })
    .catch(() => {
      alert("Failed to add item. You might not have permission.");
    });
  };

  return (
    <div>
      <header className="webshop-header">
        <div className="logo" onClick={() => navigate("/")}>
          <Link to="/frontend/public" style={{ textDecoration: "none", color: "inherit" }}>
            <span>🔆Tein Web Shop</span>
          </Link>
        </div>

        {isSellerOrAdmin && (
          <div onClick={() => navigate("/add-item")} className="add-item-logo-container">
            <img src="/images/plus.png" alt="Add Item" className="add-item-logo"/>
            <p className="hover-message">Add Item</p>
          </div>
        )}
      </header>

      <div className="formpanel">
        <h1>Add New Item</h1>
        <form onSubmit={handleSubmit}>
          <input className="item"
            type="text"
            name="title"
            placeholder="Item Title"
            value={itemData.title}
            onChange={handleChange}
            required
          />
          <textarea className="item-description"
            name="description"
            placeholder="Item Description"
            value={itemData.description}
            onChange={handleChange}
            required
          />
          <input className="item-price"
            type="number"
            name="price"
            placeholder="Item Price in Euro"
            value={itemData.price}
            onChange={handleChange}
            required
          />
          <button className="add-button" type="submit">Add Item</button>
        </form>
      </div>
    </div>
  );
};

export default NewItemForm;
