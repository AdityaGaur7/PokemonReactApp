import React from "react";
import { POKEMON_GENERATIONS } from "../constants/pokemonGenerations";

const GenerationSelector = ({ selectedGeneration, onGenerationChange }) => {
  return (
    <div className="generation-selector">
      <h2>Select Pokemon Generation</h2>
      <div className="generation-grid">
        {Object.entries(POKEMON_GENERATIONS).map(([gen, data]) => (
          <button
            key={gen}
            className={`generation-button ${
              selectedGeneration === parseInt(gen) ? "active" : ""
            }`}
            onClick={() => onGenerationChange(parseInt(gen))}
          >
            <div className="generation-info">
              <h3>{data.name}</h3>
              <p>{data.region}</p>
              <p className="generation-year">{data.year}</p>
              <p className="pokemon-count">
                {data.endId - data.startId + 1} Pokemon
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenerationSelector;
