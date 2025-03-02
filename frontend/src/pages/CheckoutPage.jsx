import apiClient from "../services/axiosConfig";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/CheckoutPage.css";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping] = useState(5);
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apt: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCart);
    calculateSubtotal(storedCart);
  }, []);

  const calculateSubtotal = (items) => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setSubtotal(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" }); // Clear error for the field being updated
  };

  const validateForm = () => {
    const errors = {};

    // Validate required fields
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.address.trim()) errors.address = "Address is required.";
    if (!formData.city.trim()) errors.city = "City is required.";
    if (!formData.zipCode.trim()) errors.zipCode = "Zip code is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";

    // Validate email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email address.";
    }

    // Validate phone number format
    if (formData.phone && !/^(\+358|0)\d{6,12}$/.test(formData.phone)) {
    errors.phone = "Invalid  phone number.";
}

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Form is valid if there are no errors
  };

  const handleOrderSubmit = () => {
  if (!validateForm()) {
    return;
  }

  const token = localStorage.getItem("access_token");
  const orderData = {
    cartItems,
    subtotal,
    shipping,
  };

  fetch("http://localhost:8000/shop/orders/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to place order.");
      }
      return response.json();
    })
    .then((data) => {
      alert("Order placed successfully!");

      // Remove the purchased items from the cart
      const remainingItems = cartItems.filter(item => item.status !== "sold");
      localStorage.setItem("cartItems", JSON.stringify(remainingItems));
      setCartItems(remainingItems);

      navigate("/order-confirmation", {
        state: {
          order: {
            orderId: data.orderId,
            date: new Date().toLocaleDateString(),
            method: "Cash on Delivery",
            billingInfo: {
              name: `${formData.firstName} ${formData.lastName}`,
              address: `${formData.address}, ${formData.apt || ""}`,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              email: formData.email,
              phone: formData.phone,
            },
            items: cartItems,
            subtotal,
            shipping,
            total: subtotal + shipping,
          },
        },
      });

      localStorage.removeItem("cartItems"); // Clear the cart
    })
    .catch((error) => {
      console.error(error);
      alert("Failed to place the order.");
    });
};


  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-content">
        {/* Delivery Address  */}
        <div className="delivery-address">
          <h2>Delivery Address</h2>
          <form>
            <div className="form-row">
              <input
                type="text"
                name="firstName"
                placeholder="* First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              {formErrors.firstName && <p className="error">{formErrors.firstName}</p>}
              <input
                type="text"
                name="lastName"
                placeholder="* Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              {formErrors.lastName && <p className="error">{formErrors.lastName}</p>}
            </div>
            <input
              type="text"
              name="address"
              placeholder="* Street Address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            {formErrors.address && <p className="error">{formErrors.address}</p>}
            <input
              type="text"
              name="apt"
              placeholder="Apt/Suite/Floor (Optional)"
              value={formData.apt}
              onChange={handleInputChange}
            />
            <div className="form-row">
              <input
                type="text"
                name="city"
                placeholder="* City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              {formErrors.city && <p className="error">{formErrors.city}</p>}
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="zipCode"
                placeholder="* Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
              />
              {formErrors.zipCode && <p className="error">{formErrors.zipCode}</p>}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <p>Order Subtotal: €{subtotal.toFixed(2)}</p>
          <p>Shipping: €{shipping.toFixed(2)}</p>
          <p>
            Grand Total: <strong>€{(subtotal + shipping).toFixed(2)}</strong>
          </p>
          <p>We currently only do cash on delivery :) </p>
          <button onClick={handleOrderSubmit} className="submit-button">
            Order
          </button>
        </div>

        {/* Contact Info  */}
        <div className="contact-info">
          <h2>Contact Info</h2>
          <form>
            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder="* Email for Order Tracking"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {formErrors.email && <p className="error">{formErrors.email}</p>}
              <input
                type="tel"
                name="phone"
                placeholder="* +358 XX XXXX XXXX or 0X XXXX XXXX"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              {formErrors.phone && <p className="error">{formErrors.phone}</p>}
            </div>
          </form>
        </div>
      </div>
      <Link to="/cart" className="back-to-cart">
        &lt; Back to Cart
      </Link>
    </div>
  );
};

export default CheckoutPage;