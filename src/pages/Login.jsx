import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(username, password);
      navigate("/lobby");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #e3f2fd, #f3e5f5)",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 320,
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Login</h2>
          <div style={{ fontSize: 12, color: "#666" }}>
            Turn-based Pokémon Battles
          </div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
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
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
          {error && <p style={{ color: "#d32f2f", margin: 0 }}>{error}</p>}
        </div>
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 14 }}>
          No account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
