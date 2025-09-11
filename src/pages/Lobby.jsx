import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Lobby() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [online, setOnline] = useState([]);
  const [roomIdInput, setRoomIdInput] = useState("");

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
        query: { userId: user?.id },
      }),
    [user?.id]
  );

  useEffect(() => {
    axios.defaults.baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:4000";
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    socket.emit("joinLobby");
    socket.on("updateLobby", (users) => setOnline(users));
    socket.on("matchFound", ({ roomId }) => navigate(`/battle/${roomId}`));
    return () => {
      socket.disconnect();
    };
  }, [socket, user, navigate]);

  const findMatch = () => {
    socket.emit("findMatch", { userId: user.id });
  };

  const createRoom = async () => {
    const roomId = `room_${Math.floor(Math.random() * 100000)}`;
    await axios.post("/api/game/create-room", { roomId, userId: user.id });
    navigate(`/battle/${roomId}`);
  };

  const joinRoom = async () => {
    if (!roomIdInput) return;
    await axios.post("/api/game/join-room", {
      roomId: roomIdInput,
      userId: user.id,
    });
    navigate(`/battle/${roomIdInput}`);
  };

  return (
    <div className="lobby-page" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Lobby</h2>
          <div style={{ color: "#666" }}>
            Logged in as <b>{user?.username}</b> • W {user?.wins} / L{" "}
            {user?.losses}
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          onClick={findMatch}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#1976d2",
            color: "#fff",
            border: 0,
          }}
        >
          Find Global Match
        </button>
        <button
          onClick={createRoom}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#2e7d32",
            color: "#fff",
            border: 0,
          }}
        >
          Create Private Room
        </button>
        <input
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ddd",
            minWidth: 220,
          }}
        />
        <button
          onClick={joinRoom}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#d81b60",
            color: "#fff",
            border: 0,
          }}
        >
          Join Room
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Online Players</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {online.map((o) => (
            <div
              key={o._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 12,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 600 }}>{o.username}</div>
              <div style={{ color: "#666", fontSize: 12 }}>
                W {o.wins} / L {o.losses}
              </div>
            </div>
          ))}
          {online.length === 0 && (
            <div style={{ color: "#666" }}>No players online yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
