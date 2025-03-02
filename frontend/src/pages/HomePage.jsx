import React, { useEffect, useState } from "react";
import apiClient from "../services/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/HomePage.css";

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSellerOrAdmin, setIsSellerOrAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

    const storedCartCount = localStorage.getItem("cartCount");
      if (storedCartCount) {
        setCartCount(parseInt(storedCartCount, 10));
      }

      apiClient
      .get("/shop/items/")
      .then((response) => {
        console.log("Fetched items:", response.data.results);
        setItems(response.data.results);
        setNextPage(response.data.next);
      })
      .catch((error) => console.error("Error fetching items:", error));

      const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const totalCount = storedCart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalCount);

    }, []);


  const handlePopulateDb = () => {
    apiClient
      .get("/shop/populate-db/")
      .then((response) => {
        alert(response.data.message);
        window.location.reload();
      })
      .catch((error) => console.error("Error populating database:", error));
  };

  const handleSearch = (searchQuery) => {
    apiClient
      .get(`/shop/items/?search=${searchQuery}`)
      .then((response) => setItems(response.data.results))
      .catch((error) => console.error("Error searching items:", error));
  };

  const handleSort = (orderBy) => {
    apiClient
      .get(`/shop/items/?ordering=${orderBy}`)
      .then((response) => setItems(response.data.results))
      .catch((error) => console.error("Error sorting items:", error));
  };

  const handleAddToCart = (item) => {
  const loggedInUserId = localStorage.getItem("user_id");

  if (item.seller === parseInt(loggedInUserId, 10)) {
    alert("You cannot add your own item to the cart.");
    return;
  }

  if (!item.status) {
    alert("Error: Status information missing from item.");
    return;
  }

  if (item.status === "sold") {
    alert("This item has already been sold and cannot be added to the cart.");
    return;
  }

  const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingItem = storedCart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    storedCart.push({ ...item, price: parseFloat(item.price), quantity: 1 });
  }

  localStorage.setItem("cartItems", JSON.stringify(storedCart));

  //  cart count from updated cart items
  const updatedCount = storedCart.reduce((acc, curr) => acc + curr.quantity, 0);
  setCartCount(updatedCount);

  alert(`${item.title} has been added to your cart!`);
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
        {/* Logo */}
        <div className="logo" onClick={() => navigate("/")}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span>🔆 Tein Web Shop</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input className="search-bar-input"
            type="text"
            placeholder="Search for Products"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Add Item  only visible to sellers or admins*/}
          {isSellerOrAdmin && (
            <div onClick={() => navigate("/add-item")} className="add-item-logo-container">
              <img
                src="/images/plus.png"
                alt="Add Item"
                className="add-item-logo"
              />
              <div className ="hover-message"> Add New Item </div>
            </div>
          )}

        {/* Populate DB */}
        <div className="populate-db-logo-container" onClick={handlePopulateDb}>
          <img
            src="/images/refresh_5794966.png"
            alt="Populate DB"
            className="populate-db-logo"
          />
          <p className="hover-message">Populate DB</p>
        </div>

        {/* Cart */}
        <div className="user-cart">
          <div className="cart-icon" onClick={() => navigate("/cart")}>
            <img
              src="/images/empty-cart.png"
              alt="Cart"
              className="cart-logo"
            />
            <span className="cart-count">{cartCount}</span>
          </div>
        </div>

        {/* Profile */}
        <div className="user-profile">
          {!isLoggedIn ? (
            <button
              className="signup-button"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => navigate("/signup")}
            >
              <img
                src="/images/profile.png"
                alt="Sign Up"
                className="profile-logo"
              />
              <p style={{ fontSize: "12px", marginTop: "5px", textAlign: "center" }}>
                Sign Up
              </p>
            </button>
          ) : (
            <div className="dropdown">
              <button
                className="dropdown-button"
                style={{ background: "none", border: "none", cursor: "pointer" }}
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

      <h1 className="header1">Deals of the Month 🛍</h1>
      <select className="sortoptions" onChange={(e) => handleSort(e.target.value)}>
        <option>Sort</option>
        <option value="price">Sort by Price (Low to High)</option>
        <option value="-price">Sort by Price (High to Low)</option>
      </select>
      <div className="item-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            <a
              href={`/item/${item.id}`}
              className="item-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={item.image || "/images/image_place.png"}
                alt={item.title}
                alt={item.title}
                className="item-imagehome"
              />
              <h3 className="item-title">{item.title}</h3>
              <p className="item-price">{item.price} €</p>
            </a>
            <button
              className="add-to-cart-button"
              onClick={() => handleAddToCart(item)}
            >
              <img
                src="/images/shopping-bag.png"
                alt="add to cart"
                className="add-to-cart"
              />
            </button>
          </div>
        ))}
      </div>
      {nextPage && (
        <button
          className="loadmore"
          onClick={() =>
            apiClient.get(nextPage).then((response) => {
              setItems((prevItems) => [...prevItems, ...response.data.results]);
              setNextPage(response.data.next);
            })
          }
        >
          Explore More
        </button>
      )}
    </div>
  );
};

export default HomePage;