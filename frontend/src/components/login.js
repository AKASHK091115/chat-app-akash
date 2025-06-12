// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3305/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      const { token, user } = await res.json();

      if (window.PasswordCredential && navigator.credentials) {
        const cred = new window.PasswordCredential({
          id: email,
          password: password,
          name: user.name || email,
        });
        try {
          await navigator.credentials.store(cred);
        } catch (err) {
          console.warn("Credential store failed:", err);
        }
      }

      onLogin(token, user);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>beta-chat</h2>
        <p style={styles.subtitle}>Login to continue chatting</p>
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="on">
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
          />
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
            autoComplete="current-password"
          />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={styles.switchText}>
          Don&apos;t have an account?{" "}
          <span style={styles.switchLink} onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6e8efb, #a777e3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "400px",
    padding: "40px",
    borderRadius: "16px",
    background: "white",
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "10px",
    fontSize: "28px",
    color: "#333",
    fontWeight: 700,
  },
  subtitle: {
    marginBottom: "30px",
    fontSize: "14px",
    color: "#666",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "14px",
    marginBottom: "20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "all 0.2s",
  },
  button: {
    padding: "14px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6e8efb",
    backgroundImage: "linear-gradient(to right, #6e8efb, #a777e3)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.3s",
  },
  error: {
    marginBottom: "20px",
    color: "red",
    fontWeight: "600",
  },
  switchText: {
    marginTop: "20px",
    color: "#555",
  },
  switchLink: {
    color: "#6e8efb",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
