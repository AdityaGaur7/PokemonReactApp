import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password);
      navigate("/lobby");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
      }}
    >
      <div
        style={{
          width: 340,
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 16, textAlign: "center" }}>
          Register
        </h2>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <button
            type="submit"
            style={{
              padding: 10,
              borderRadius: 8,
              background: "#d81b60",
              color: "#fff",
              border: 0,
              cursor: "pointer",
            }}
          >
            Create account
          </button>
          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
        </form>
        <p style={{ marginTop: 12, textAlign: "center" }}>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
