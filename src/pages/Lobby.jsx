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
    <div className="lobby-page">
      <h2>Lobby</h2>
      <div>
        <p>Logged in as: {user?.username}</p>
        <p>
          W: {user?.wins} / L: {user?.losses}
        </p>
        <button onClick={logout}>Logout</button>
      </div>
      <hr />
      <div>
        <button onClick={findMatch}>Find Global Match</button>
      </div>
      <div>
        <button onClick={createRoom}>Create Private Room</button>
        <input
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <hr />
      <h3>Online Players</h3>
      <ul>
        {online.map((o) => (
          <li key={o._id}>
            {o.username} (W{o.wins}/L{o.losses})
          </li>
        ))}
      </ul>
    </div>
  );
}
