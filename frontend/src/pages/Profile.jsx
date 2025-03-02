import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({});
  const [editable, setEditable] = useState(false);
  const [isSellerOrAdmin, setIsSellerOrAdmin] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    axios
      .get("/shop/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Profile data in AccountPage.jsx:", response.data);
        setUser(response.data);
        setIsSellerOrAdmin(response.data.is_seller || response.data.is_superuser);  // Set correct role
      })
      .catch((error) => console.error("Error fetching user profile:", error));
  }
}, []);


  const handleSave = () => {
  const token = localStorage.getItem("access_token");
  axios
    .put("/shop/profile/", user, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      setUser(response.data);
      setEditable(false);
    })
    .catch((error) => console.error("Error updating profile:", error));
};

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      {editable ? (
        <div className="profile-edit-form">
          <input
            type="text"
            value={user.first_name || ""}
            onChange={(e) => setUser({ ...user, first_name: e.target.value })}
            placeholder="First Name"
          />
          <input
            type="text"
            value={user.last_name || ""}
            onChange={(e) => setUser({ ...user, last_name: e.target.value })}
            placeholder="Last Name"
          />
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder="Email"
          />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="profile-info">
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <button onClick={() => setEditable(true)}>Edit</button>
        </div>
      )}
      {isSellerOrAdmin && (
        <button
          className="add-item-button"
          onClick={() => window.location.href = "/add-item"}
        >
          Add New Item
        </button>
      )}
    </div>
  );
};

export default Profile;
