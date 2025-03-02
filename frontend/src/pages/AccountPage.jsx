import React, { useState, useEffect } from "react";
import { decodeToken } from "../services/decodeToken";
import axios from "../services/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/AccountPage.css";

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [isSellerOrAdmin, setIsSellerOrAdmin] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [messageType, setMessageType] = useState("");
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  const calculateTotal = (items) => {
    const newTotal = items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCart);
    calculateTotal(storedCart);

    if (token) {
      const payload = decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        setIsSessionExpired(true);
        localStorage.clear();
      } else {
        axios
          .get("/shop/profile/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setUser(response.data);
            setIsSellerOrAdmin(response.data.is_seller || response.data.is_superuser);
          })
          .catch((error) => console.error("Error fetching user profile:", error));

        // Fetch Order History
        axios
          .get("/orders/history/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setOrderHistory(response.data);
          })
          .catch((error) => console.error("Error fetching order history:", error));
      }
    }
  }, [token]);

  if (isSessionExpired) {
    return (
      <div>
        <p>Session expired. Please <a href="/login">log in again</a>.</p>
      </div>
    );
  }

  if (!user) {
    return <p>401 : Unauthenticated</p>;
  }

  const handleChangePassword = (e) => {
    e.preventDefault();
    axios
      .put(
        "http://127.0.0.1:8000/api/change-password/",
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setMessage(response.data.message);
        setMessageType("success");
        setOldPassword("");
        setNewPassword("");
      })
      .catch((error) => {
        setMessage(error.response?.data?.error || "Failed to change password");
        setMessageType("error");
      });

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div>
      <header className="webshop-header">
        <div className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span>🔆Tein Web Shop</span>
          </Link>
        </div>
        <div className="user-cart">
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            <img src="/images/empty-cart.png" alt="Cart" className="cart-logo" />
            <span className="cart-count">{cartItems.length}</span>
          </div>
        </div>
      </header>

      <div className="account-container">
        <div className="account-panel">
          <h2>Account Information</h2>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        {/* Change Password Panel */}
        <div className="password-panel">
          <h2 onClick={() => setShowPasswordPanel(!showPasswordPanel)}>Change Password</h2>
          {showPasswordPanel && (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Old Password</label>
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <button className="show-button" type="button" onClick={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button className="show-button" type="button" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button type="submit" className="submit-button">
                Change Password
              </button>
              {message && <p className={messageType}>{message}</p>}
            </form>
          )}
        </div>

        {/* Order History Panel */}
        <div className="order-history-panel">
          <h2 onClick={() => setShowOrderHistory(!showOrderHistory)}>Order History</h2>
          {showOrderHistory && (
            <ul>
              {orderHistory.length > 0 ? (
                orderHistory.map((order) => (
                  <li key={order.id}>
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> €{order.total_price.toFixed(2)}</p>
                    <ul className="order-history-ul">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          <p><strong>Product : </strong> {item.product_name}</p>
                          <p>Price : € {item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))
              ) : (
                <p>No order history found.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
