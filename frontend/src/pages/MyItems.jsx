import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import apiClient from "../services/axiosConfig";
import "../CSS/MyItes.css";

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSellerOrAdmin, setIsSellerOrAdmin] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");

        if (token && userId) {
            apiClient
                .get("/shop/profile/")
                .then((response) => {
                    if (response.data.is_seller || response.data.is_superuser) {
                        setIsSellerOrAdmin(true);
                        fetchSellerItems(userId);
                    } else {
                        alert("Only sellers or admins can access this page.");
                    }
                })
                .catch((error) => console.error("Error fetching profile:", error));
        } else {
            alert("Please log in as a seller or admin to view your items.");
        }
    }, []);

    const fetchSellerItems = (userId) => {
        apiClient
            .get(`/shop/myitems/`)
            .then((response) => {
                setItems(response.data);
            })
            .catch((error) => console.error("Error fetching items:", error))
            .finally(() => setLoading(false));
    };

    if (loading) return <p>Loading items...</p>;

    return (
        <>
            <header className="webshop-header">
                <div className="logo" onClick={() => navigate("/")}>
                    <Link to="/" style={{textDecoration: "none", color: "inherit"}}>
                        <span>🔆Tein Web Shop</span>
                    </Link>
                </div>
                <div className="user-cart">
                    <div className="cart-icon" onClick={() => navigate("/cart")}>
                        <img src="/images/empty-cart.png" alt="Cart" className="cart-logo"/>
                        <span className="cart-count">{cartCount}</span>
                    </div>
                </div>
            </header>

            <div className="my-items-container">
                <h1>My Items</h1>
                {items.length === 0 ? (
                    <p>No items found.</p>
                ) : (
                    <table className="items-table">
                        <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price (€)</th>
                            <th>Created Date</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <Link to={`/item/${item.id}`}>{item.title}</Link>
                                </td>
                                <td>{item.price}</td>
                                <td>{new Date(item.date_added).toLocaleDateString()}</td>
                                <td className={item.status === "sold" ? "sold-status" : "on-sale-status"}>
                                    {item.status === "sold" ? "Sold" : "On Sale"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                </div>
                {isSellerOrAdmin ? (
                <button
                    className="add-item-button"
                    onClick={() => (window.location.href = "/add-item")}
                >
                  Add New Item
                </button>
            ) : (
                <p></p>
            )}
        </>
    );
}

export default MyItems;