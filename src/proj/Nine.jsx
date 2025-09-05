import React, { useState } from "react";
import { POKEMON_GENERATIONS } from "../constants/pokemonGenerations";
import { usePokemonData } from "../hooks/usePokemonData";
import GenerationSelector from "../components/GenerationSelector";
import PokemonSearch from "../components/PokemonSearch";
import PokemonCard from "../components/PokemonCard";
import InfiniteScroll from "../components/InfiniteScroll";

function Nine() {
  const [selectedGeneration, setSelectedGeneration] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const generationData = POKEMON_GENERATIONS[selectedGeneration];
  const { pokemonList, loading, error, hasMore, loadMore, searchPokemon } =
    usePokemonData(generationData, searchTerm);

  const handleGenerationChange = (generation) => {
    setSelectedGeneration(generation);
    setSearchTerm("");
    // Clear any existing search results
    searchPokemon("");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    searchPokemon(term);
  };

  return (
    <div className="pokemon-app">
      <div className="logo">
        <img src="\img\Pokédex_logo.png" alt="Pokemon Logo" />
      </div>
      

      <GenerationSelector
        selectedGeneration={selectedGeneration}
        onGenerationChange={handleGenerationChange}
      />

      <PokemonSearch
        onSearch={handleSearch}
        placeholder={`Search Pokemon in ${generationData?.name}...`}
      />

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading}>
        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      </InfiniteScroll>

      {!loading && pokemonList.length === 0 && !error && (
        <div className="no-results">
          <p>No Pokemon found. Try a different search term or generation.</p>
        </div>
      )}
    </div>
  );
}

export default Nine;
