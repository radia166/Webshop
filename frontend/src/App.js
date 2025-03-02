import React from "react";
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/Signup";
import NewItemForm from "./pages/NewItemForm";
import ProtectedRoute from "./component/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AccountPage from "./pages/AccountPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ItemPage from "./pages/ItemPage";
import Profile from "./pages/Profile";
import MyItems from "./pages/MyItems";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="shop/profile" element={<Profile />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />}/>
        <Route path="/add-item" element={<NewItemForm />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/myitems" element={<MyItems />} />
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}/>
      </Routes>
    </Router>
  );
}

export default App;