import React, { useState } from "react";

const PokemonSearch = ({
  onSearch,
  placeholder = "Search Pokemon by name or ID...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="pokemon-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default PokemonSearch;
