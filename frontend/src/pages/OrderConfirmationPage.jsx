import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../CSS/OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <p>Order details not found!</p>;
  }

  return (
    <div className="confirmation-container">
      <div className="thank-you-section">
        <h1> &#127882; Order Placed &#127882; </h1>
        <p>Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.</p>
        <div className="billing-info">
          <h2>Billing Address</h2>
          <p><strong>Name:</strong> {order.billingInfo?.name}</p>
          <p><strong>Address:</strong> {order.billingInfo?.address}</p>
          <p><strong>City:</strong> {order.billingInfo?.city}</p>
          <p><strong>State:</strong> {order.billingInfo?.state}</p>
          <p><strong>Zip Code:</strong> {order.billingInfo?.zipCode}</p>
          <p><strong>Email:</strong> {order.billingInfo?.email}</p>
          <p><strong>Phone:</strong> {order.billingInfo?.phone}</p>
        </div>
        <Link to="/" className="back-home">Back to Home</Link>
      </div>

      <div className="order-summary1">
        <h2>Order Summary</h2>
        <div className="order-details">
          <p><strong>Date:</strong> {order.date}</p>
          <p><strong>Order Number:</strong> {order.orderId}</p>
          <p><strong>Payment Method:</strong> {order.method}</p>
        </div>
        <div className="item-list">
          {order.items?.map((item, index) => (
            <div key={index} className="item">
              <p><strong>{item.title}</strong></p>
              <p>Qty: {item.quantity}</p>
              <p>Price: €{item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="totals">
          <p><strong>Sub Total:</strong> €{order.subtotal?.toFixed(2)}</p>
          <p><strong>Shipping:</strong> €{order.shipping?.toFixed(2)}</p>
          <p><strong>Order Total:</strong> €{order.total?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;