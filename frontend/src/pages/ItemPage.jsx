import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../services/axiosConfig";
import "../CSS/ItemPage.css";
import apiClient from "../services/axiosConfig";

const ItemPage = () => {
  const {id} = useParams();  // Get item ID from URL
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isSeller, setIsSeller] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [relatedItems, setRelatedItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    status: "",
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/shop/items/${id}/`);
        console.log("Fetched item:", response.data);  // Debugging
        if (!response.data.status) {
          console.error("Item status is missing from API response");
        }
        setItem(response.data);
        setFormData(response.data);

        // check if logged in user is seller
        const loggedInUserId = parseInt(localStorage.getItem("user_id"), 10);
        if (response.data.seller === loggedInUserId) {
          setIsSeller(true);
        }
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();

    apiClient.get("/shop/items/")
    .then(response => {
      // Randomly  4-5 items
      const shuffled = response.data.results.sort(() => 0.5 - Math.random());
      setRelatedItems(shuffled.slice(0, 5));
    })
    .catch(error => console.error("Error fetching related items:", error));

    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const totalCount = storedCart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(totalCount);

  }, [id]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleUpdateItem = async () => {
    try {
      await axios.put(`/shop/items/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      alert("Item updated successfully!");
      setIsEditing(false);
      setItem(formData);
    } catch (error) {
      alert("Failed to update item.");
      console.error("Error updating item:", error);
    }
  };

  const handleAddToCart = (item) => {
    const loggedInUserId = localStorage.getItem("user_id");

    if (!item.status) {
      alert("Error: Status information missing from item.");
      return;
    }

    if (item.seller === parseInt(loggedInUserId, 10)) {
      alert("You cannot add your own item to the cart.");
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

    const cartCount = storedCart.reduce((acc, curr) => acc + curr.quantity, 0);
    localStorage.setItem("cartCount", cartCount);
    setCartCount(cartCount);
    alert("Item added to cart!");
};


  if (loading) return <p>Loading item details.Please wait..</p>;
  if (!item) return <p>Item not found.</p>;

  //  status label based on the item and user role
  const loggedInUserId = parseInt(localStorage.getItem("user_id"), 10);
  let statusLabel = "";

  if (item.status === "sold") {
    statusLabel = item.seller === loggedInUserId ? "Sold" : "Purchased";
  } else {
    statusLabel = "On Sale";
  }
  return (
      <div>
        <header className="webshop-header">
          <div className="logo" onClick={() => navigate("/")}>
            <Link to="/" style={{textDecoration: "none", color: "inherit"}}>
              <span>🔆Tein Web Shop</span>
            </Link>
          </div>
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
        </header>

        <div className="detail-container">
          <div className="item-page">
            <div className="image-container">
              <img className="img-logo" src="/images/image_place.png" alt="Item"/>
            </div>
            <div className="item-details1">
              {isEditing ? (
                  <>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}

                    />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={item.status === "sold"} // Prevent price change if sold
                    />
                    <button onClick={handleUpdateItem} className="save-button">
                      Save Changes
                    </button>
                    <button onClick={() => setIsEditing(false)} className="cancel-button">
                      Cancel
                    </button>
                  </>
              ) : (
                  <>
                    <h1>{item.title}</h1>
                    <p><strong>Description:</strong> {item.description}</p>
                    <p><strong>Price:</strong> €{item.price}</p>
                    <p><strong>Date Added:</strong> {new Date(item.date_added).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {statusLabel}</p>

                    {!isSeller ? (
                        <button onClick={() => handleAddToCart(item)} className="add-to-cart-button1"
                                disabled={item.status === "sold"}>
                          {item.status === "sold" ? "Sold Out" : "Add to Cart"}
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="edit-button">
                          Edit Item
                        </button>
                    )}
                  </>

              )
              }
            </div>
          </div>
        </div>

        <div className="related-items">
          <h2>Related Items:</h2>
          <div className="related-items-list">
            {relatedItems.map((relatedItem) => (
                <div key={relatedItem.id} className="related-item">
                  <a href={`/item/${relatedItem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img className="related-img" src="/images/image_place.png" alt={relatedItem.title} />
                    <p>{relatedItem.title}</p>
                    <p>€{relatedItem.price}</p>
                  </a>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}

export default ItemPage;