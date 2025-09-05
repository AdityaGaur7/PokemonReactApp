import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PokemonCard = ({ pokemon, onLoad }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    setImageError(true);
    if (onLoad) onLoad();
  };

  const handleCardClick = () => {
    navigate(`/pokemon/${pokemon.id}`);
  };

  return (
    <div ref={cardRef} className="pokemon-card" onClick={handleCardClick}>
      {isVisible ? (
        <div className="card-content">
          <div className="pokemon-image-container">
            {!imageLoaded && !imageError && (
              <div className="image-skeleton">
                <div className="skeleton-loader"></div>
              </div>
            )}
            <img
              src={
                imageError
                  ? pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.other?.["official-artwork"]?.front_default ||
                  pokemon.sprites?.front_default ||
                  "/img/Error404.gif"
                  : `https://play.pokemonshowdown.com/sprites/ani/${pokemon.name}.gif`
              }
              alt={pokemon.name}
              className={`pokemon-image ${imageLoaded ? "loaded" : "loading"}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: imageLoaded || imageError ? "block" : "none" }}
            />
          </div>
          <div className="pokemon-info">
            <h3 className="pokemon-name">{pokemon.name}</h3>
            <p className="pokemon-id">#{pokemon.id}</p>
            <div className="pokemon-types">
              {pokemon.types?.map((type, index) => (
                <span
                  key={index}
                  className={`type-badge type-${type.type.name}`}
                >
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-skeleton">
          <div className="skeleton-loader"></div>
        </div>
      )}
    </div>
  );
};

export default PokemonCard;
