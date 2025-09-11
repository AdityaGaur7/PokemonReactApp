import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

export default function Battle() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_API_URL || "http://localhost:4000", {
        query: { userId: user?.id },
      }),
    [user?.id]
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    socket.emit("joinRoom", { roomId });
    socket.on("updateGame", (g) => setGame(g));
    socket.on("gameEnd", ({ winner }) => {
      alert(winner === user.id ? "You win!" : "You lose!");
      navigate("/lobby");
    });
    // mark ready on mount
    socket.emit("playerReady", { roomId, userId: user.id });
    return () => socket.disconnect();
  }, [socket, roomId, user, navigate]);

  if (!game) return <div>Loading game...</div>;

  const meIndex = game.players.findIndex((p) => p.id === user.id);
  const opponentIndex = meIndex === 0 ? 1 : 0;
  const my = game.players[meIndex] || { team: [] };
  const them = game.players[opponentIndex] || { team: [] };

  const myAlive = (my.team || []).filter((p) => p.currentHp > 0);

  const myTurn = game.turn === meIndex && game.status === "in_progress";

  const chooseActive = (idx) => {
    if (!myTurn) return;
    if (my.team[idx].currentHp <= 0) return;
    // Switch action consumes turn
    socket.emit("playTurn", {
      roomId,
      userId: user.id,
      activeIndex: idx,
      action: "switch",
    });
  };

  const attack = () => {
    if (!myTurn) return;
    const active = my.team[my.activeIndex];
    if (!active || active.currentHp <= 0) return;
    socket.emit("playTurn", { roomId, userId: user.id, action: "attack" });
  };

  return (
    <div className="battle-page" style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Room: {roomId}</h2>
      <p style={{ marginBottom: 16 }}>
        Status: {game.status} | Turn: {myTurn ? "Your turn" : "Opponent turn"}
      </p>
      {/* Arena showing active Pokémon centered */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "#f5f5f5",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>You</div>
          {my.team[my.activeIndex] && (
            <img
              alt={my.team[my.activeIndex].name}
              src={`https://play.pokemonshowdown.com/sprites/ani/${
                my.team[my.activeIndex].name
              }.gif`}
              style={{ width: 120, height: 120 }}
              onError={(e) => {
                e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                  my.team[my.activeIndex].id
                }.png`;
              }}
            />
          )}
          {my.team[my.activeIndex] && (
            <div style={{ marginTop: 8 }}>
              <div style={{ textTransform: "capitalize" }}>
                {my.team[my.activeIndex].name}
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                HP {my.team[my.activeIndex].currentHp}/
                {my.team[my.activeIndex].baseStats.hp}
              </div>
            </div>
          )}
          {myTurn &&
            my.team[my.activeIndex] &&
            my.team[my.activeIndex].currentHp > 0 && (
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={attack}
                  style={{ padding: "8px 12px", fontWeight: 600 }}
                >
                  Attack
                </button>
              </div>
            )}
        </div>
        <div
          style={{
            textAlign: "center",
            background: "#f5f5f5",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Opponent</div>
          {them.team[them.activeIndex] && (
            <img
              alt={them.team[them.activeIndex].name}
              src={`https://play.pokemonshowdown.com/sprites/ani/${
                them.team[them.activeIndex].name
              }.gif`}
              style={{ width: 120, height: 120 }}
              onError={(e) => {
                e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                  them.team[them.activeIndex].id
                }.png`;
              }}
            />
          )}
          {them.team[them.activeIndex] && (
            <div style={{ marginTop: 8 }}>
              <div style={{ textTransform: "capitalize" }}>
                {them.team[them.activeIndex].name}
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                HP {them.team[them.activeIndex].currentHp}/
                {them.team[them.activeIndex].baseStats.hp}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Benches to switch from */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3>Your Team</h3>
          {my.team.map((p, idx) => (
            <div
              key={p.id}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                background: my.activeIndex === idx ? "#e8f5e9" : "#fafafa",
                border:
                  my.activeIndex === idx
                    ? "2px solid #2e7d32"
                    : "1px solid #ddd",
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <img
                alt={p.name}
                src={`https://play.pokemonshowdown.com/sprites/ani/${p.name}.gif`}
                style={{ width: 64, height: 64, imageRendering: "pixelated" }}
                onError={(e) => {
                  e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ textTransform: "capitalize", fontWeight: 600 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  HP {p.currentHp}/{p.baseStats.hp}
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#eee",
                    borderRadius: 4,
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.round((p.currentHp / p.baseStats.hp) * 100)
                      )}%`,
                      height: 8,
                      background: "#43a047",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
              {myTurn &&
                p.currentHp > 0 &&
                (my.activeIndex === idx ? (
                  <span
                    style={{ fontSize: 12, color: "#2e7d32", fontWeight: 600 }}
                  >
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => chooseActive(idx)}
                    style={{ padding: "6px 10px" }}
                  >
                    Switch
                  </button>
                ))}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Opponent</h3>
          {them.team.map((p, idx) => (
            <div
              key={p.id}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                background: them.activeIndex === idx ? "#ffebee" : "#fafafa",
                border:
                  them.activeIndex === idx
                    ? "2px solid #c62828"
                    : "1px solid #ddd",
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <img
                alt={p.name}
                src={`https://play.pokemonshowdown.com/sprites/ani/${p.name}.gif`}
                style={{ width: 64, height: 64, imageRendering: "pixelated" }}
                onError={(e) => {
                  e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ textTransform: "capitalize", fontWeight: 600 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  HP {p.currentHp}/{p.baseStats.hp}
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#eee",
                    borderRadius: 4,
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.round((p.currentHp / p.baseStats.hp) * 100)
                      )}%`,
                      height: 8,
                      background: "#e53935",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
