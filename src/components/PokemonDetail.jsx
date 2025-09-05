import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { POKEAPI_BASE_URL } from "../constants/pokemonGenerations";

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${id}`);
        setPokemon(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch Pokemon details");
        console.error("Error fetching Pokemon details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPokemonDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="pokemon-detail-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Pokemon details...</p>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="pokemon-detail-error">
        <h2>Pokemon not found</h2>
        <p>{error || "The requested Pokemon could not be found."}</p>
        <button onClick={() => navigate("/")} className="back-button">
          Back to Pokemon List
        </button>
      </div>
    );
  }

  const getStatColor = (statName) => {
    const statColors = {
      hp: "#4caf50",
      attack: "#f44336",
      defense: "#2196f3",
      "special-attack": "#ff9800",
      "special-defense": "#9c27b0",
      speed: "#00bcd4",
    };
    return statColors[statName] || "#4caf50";
  };

  const formatStatName = (statName) => {
    return statName.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="pokemon-detail">
      <div className="pokemon-detail-header">
        <button onClick={() => navigate("/")} className="back-button">
          ← Back to Pokemon List
        </button>
        <h1 className="pokemon-detail-title">
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} #
          {pokemon.id}
        </h1>
      </div>

      <div className="pokemon-detail-content">
        {/* Main Info Section */}
        <div className="pokemon-detail-main">
          <div className="pokemon-image-section">
            <img
              src={
                pokemon.sprites.other?.["official-artwork"]?.front_default ||
                pokemon.sprites.front_default ||
                `/img/Error404.gif`
              }
              alt={pokemon.name}
              className="pokemon-detail-image"
              onError={(e) => {
                e.target.src = "/img/Error404.gif";
              }}
            />
            <div className="pokemon-types">
              {pokemon.types.map((type, index) => (
                <span
                  key={index}
                  className={`type-badge type-${type.type.name}`}
                >
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="pokemon-basic-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Height</span>
                <span className="info-value">
                  {(pokemon.height / 10).toFixed(1)} m
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Weight</span>
                <span className="info-value">
                  {(pokemon.weight / 10).toFixed(1)} kg
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Base Experience</span>
                <span className="info-value">{pokemon.base_experience}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Order</span>
                <span className="info-value">{pokemon.order}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="pokemon-detail-section">
          <h2>Base Stats</h2>
          <div className="stats-container">
            {pokemon.stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-header">
                  <span className="stat-name">
                    {formatStatName(stat.stat.name)}
                  </span>
                  <span className="stat-value">{stat.base_stat}</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-fill"
                    style={{
                      width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                      backgroundColor: getStatColor(stat.stat.name),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abilities Section */}
        <div className="pokemon-detail-section">
          <h2>Abilities</h2>
          <div className="abilities-container">
            {pokemon.abilities.map((ability, index) => (
              <div
                key={index}
                className={`ability-item ${
                  ability.is_hidden ? "hidden-ability" : ""
                }`}
              >
                <span className="ability-name">
                  {ability.ability.name
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                {ability.is_hidden && (
                  <span className="hidden-badge">Hidden</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Moves Section */}
        <div className="pokemon-detail-section">
          <h2>Moves ({pokemon.moves.length})</h2>
          <div className="moves-container">
            {pokemon.moves.slice(0, 20).map((move, index) => (
              <span key={index} className="move-item">
                {move.move.name
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            ))}
            {pokemon.moves.length > 20 && (
              <span className="more-moves">
                +{pokemon.moves.length - 20} more moves
              </span>
            )}
          </div>
        </div>

        {/* Game Indices Section */}
        <div className="pokemon-detail-section">
          <h2>Game Appearances</h2>
          <div className="games-container">
            {pokemon.game_indices.slice(0, 10).map((game, index) => (
              <span key={index} className="game-item">
                {game.version.name
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            ))}
            {pokemon.game_indices.length > 10 && (
              <span className="more-games">
                +{pokemon.game_indices.length - 10} more games
              </span>
            )}
          </div>
        </div>

        {/* Held Items Section */}
        {pokemon.held_items && pokemon.held_items.length > 0 && (
          <div className="pokemon-detail-section">
            <h2>Held Items</h2>
            <div className="items-container">
              {pokemon.held_items.map((item, index) => (
                <div key={index} className="item-item">
                  <span className="item-name">
                    {item.item.name
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sprites Section */}
        <div className="pokemon-detail-section">
          <h2>Sprites</h2>
          <div className="sprites-container">
            {pokemon.sprites.front_default && (
              <div className="sprite-item">
                <img src={pokemon.sprites.front_default} alt="Front Default" />
                <span>Front Default</span>
              </div>
            )}
            {pokemon.sprites.back_default && (
              <div className="sprite-item">
                <img src={pokemon.sprites.back_default} alt="Back Default" />
                <span>Back Default</span>
              </div>
            )}
            {pokemon.sprites.front_shiny && (
              <div className="sprite-item">
                <img src={pokemon.sprites.front_shiny} alt="Front Shiny" />
                <span>Front Shiny</span>
              </div>
            )}
            {pokemon.sprites.back_shiny && (
              <div className="sprite-item">
                <img src={pokemon.sprites.back_shiny} alt="Back Shiny" />
                <span>Back Shiny</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;
