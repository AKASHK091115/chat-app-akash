// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import ChatDashboard from "./chatboard/chatdash"
import { setAuthToken as applyTokenToAPI } from './api';
function App() {
 const [token, setToken] = useState(() => sessionStorage.getItem("token"));
const [user, setUser] = useState(() => {
  const savedUser = sessionStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
  });  
  // Login handler
  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    applyTokenToAPI(token);
     sessionStorage.setItem("token", token);
     sessionStorage.setItem("user", JSON.stringify(user));
  };

  // Logout handler for example
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    applyTokenToAPI(null);
    sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  };

  return (
    <Router>
      <Routes>
        {/* Public routes (Login/Register) - accessible only if NOT logged in */}
        {!user && (
          <>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* Protected routes - accessible ONLY if logged in */}
        {user && (
          <>
            <Route
  path="/dashboard"
  element={<ChatDashboard user={user} token={token} onLogout={handleLogout} />}
/>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
