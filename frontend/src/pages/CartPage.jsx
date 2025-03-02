// CartPage.jsx
import apiClient from "../services/axiosConfig";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../CSS/CartPage.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isSellerOrAdmin, setIsSellerOrAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(storedCart);
    calculateTotal(storedCart);

    // Check if the user is logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      apiClient
      .get("/shop/profile/")
      .then((response) => {
        const user = response.data;
        localStorage.setItem("user_id", user.id); // Store user ID
        if (user.is_staff || user.is_seller) {
          setIsSellerOrAdmin(true);
        }
      })
      .catch((error) => console.error("Error fetching user details:", error));
    }

  }, []);


  const calculateTotal = (items) => {
    const newTotal = items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0
    );
    setTotal(newTotal);
  };

  const handlePay = () => {
  const token = localStorage.getItem("access_token");
  const loggedInUserId = parseInt(localStorage.getItem("user_id"), 10);

  if (!token) {
    alert("Please log in or sign up to continue.");
    navigate("/login");
    return;
  }

  // Check if any cart item belongs to the logged-in user
  const selfOwnedItems = cartItems.filter(item => item.seller === loggedInUserId);

  if (selfOwnedItems.length > 0) {
    alert("You cannot proceed to checkout with your own items in the cart.");

    // Remove self-owned items from cart
    const filteredCart = cartItems.filter(item => item.seller !== loggedInUserId);
    setCartItems(filteredCart);
    localStorage.setItem("cartItems", JSON.stringify(filteredCart));
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  apiClient
    .post("/shop/cart/validate/", { items: cartItems }, { headers })
    .then((response) => {
      const { valid, updatedCart, errors } = response.data;

      if (!valid) {
        // update cart items with any new prices
          setCartItems(updatedCart);
          // recalculate total after updating prices
          const newTotal = updatedCart.reduce(
            (acc, item) => acc + Number(item.price) * item.quantity,
            0
          );
          setTotal(newTotal);
        setErrors(errors);
        alert("Some items in your cart have issues. Please review them.");
      } else {
        navigate("/checkout");
      }
    })
    .catch((error) => {
      console.error("Error validating cart:", error);

      if (error.response && error.response.status === 401) {
        alert("Please log in or sign up to continue");
        navigate("/login");
      } else {
        alert("An error occurred during cart validation. Please try again.");
      }
    });
};


  const handleSignIn = () => navigate("/login");
  const handleSignUp = () => navigate("/signup");

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  };

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartCount");
    sessionStorage.clear();  // Clear session data

    window.location.href = "/";
  };


  return (
    <div>
      <header className="webshop-header">
        <div className="logo">
          <Link to="/" style={{textDecoration: "none", color: "inherit"}}>
            <span>🔆Tein Web Shop</span>
          </Link>
        </div>
        <div className="user-cart">
          <div className="cart-icon">
            <img
                src="/images/empty-cart.png"
                alt="Cart"
                className="cart-logo"
            />
            <span className="cart-count">{cartItems.length}</span>
          </div>
        </div>
        {/*profile*/}
        <div className="user-profile">
          {!isLoggedIn ? (
              <button
                  className="signup-button"
                  style={{background: "none", border: "none", cursor: "pointer"}}
                  onClick={() => navigate("/signup")}
              >
                <img
                    src="/images/profile.png"
                    alt="Sign Up"
                    className="profile-logo"
                />
                <p style={{fontSize: "12px", marginTop: "5px", textAlign: "center"}}>
                  Sign Up
                </p>
              </button>
          ) : (
              <div className="dropdown">
                <button
                    className="dropdown-button"
                    style={{background: "none", border: "none", cursor: "pointer"}}
                >
                  <img
                      src="/images/profile.png"
                      alt="Profile"
                      className="profile-logo"
                  />
                </button>
                <div className="dropdown-content">
                  <button
                      className="dropdown-item"
                      onClick={() => navigate("/account")}
                  >
                    Account
                  </button>
                  {isSellerOrAdmin && (
                    <button
                      className="dropdown-item"
                      onClick={() => navigate("/myitems")}>
                      My Items
                    </button>
                  )}
                  <button
                      className="dropdown-item"
                      onClick={() => {
                        handleSignOut()
                        localStorage.removeItem("access_token");
                        setIsLoggedIn(false);
                        alert("You have been signed out.");
                        navigate("/");
                      }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
          )}
        </div>
      </header>

      <div className="cart-container">
        <h1 className="cart-title">Your Cart ({cartItems.length} items)</h1>
        {cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <p>Your cart is currently empty.</p>
            </div>
        ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-details">
                        <h2>{item.title}</h2>
                        <p className="item-subtext">{item.description}</p>
                        {/* Display error message if present */}
                        {errors.some((error) => error.id === item.id) && (
                            <p className="error-message">
                              {errors.find((error) => error.id === item.id)?.message}
                            </p>
                        )}
                      </div>
                      <div className="item-price">{item.price}</div>
                      <div className="item-quantity">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                          -
                        </button>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                                handleQuantityChange(item.id, parseInt(e.target.value, 10))
                            }
                        />
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                        +
                  </button>
                </div>
                <div className="item-total">€{(item.price * item.quantity).toFixed(2)}</div>
                <button className="remove-item" onClick={() => handleRemoveItem(item.id)}>
                  &#10060;
                </button>
              </div>
                  ))
              }
            </div>
              <div className="cart-summary">
                <h2>Order Summary</h2>
                <p>Subtotal: €{total.toFixed(2)}</p>
                <p>Shipping: €5.00</p>
                <p>
                  Grand Total: <strong>€{(total + 5).toFixed(2)}</strong>
                </p>

                {!isLoggedIn && (
                    <div>
                      <button onClick={handleSignIn} className="loginlink">
                        Log in
                      </button>
                      <p>Or</p>
                      <button onClick={handleSignUp} className="signuplink">
                        Sign up
                      </button>
                    </div>
                )}
                <button className="checkout-button" onClick={handlePay}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
