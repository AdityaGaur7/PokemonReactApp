import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { POKEAPI_BASE_URL, POKEMON_PER_PAGE } from '../constants/pokemonGenerations';

export const usePokemonData = (generation, searchTerm = '') => {
    const [pokemonList, setPokemonList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const fetchPokemonData = useCallback(async (gen, search, pageNum = 1, append = false) => {
        if (!gen) return;

        console.log('Fetching Pokemon data:', { gen, search, pageNum, append });
        setLoading(true);
        setError(null);

        try {
            let pokemonData = [];

            if (search) {
                // Search for specific Pokemon
                try {
                    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${search.toLowerCase()}`);
                    const pokemon = {
                        id: response.data.id,
                        name: response.data.name,
                        types: response.data.types,
                        sprites: response.data.sprites
                    };
                    pokemonData = [pokemon];
                    setHasMore(false);
                } catch (searchError) {
                    setError('Pokemon not found');
                    setPokemonList([]);
                    setHasMore(false);
                    return;
                }
            } else {
                // Fetch Pokemon by generation
                const genData = gen; // Use the gen parameter instead of generation from closure
                const startId = genData.startId + (pageNum - 1) * POKEMON_PER_PAGE;
                const endId = Math.min(startId + POKEMON_PER_PAGE - 1, genData.endId);

                const promises = [];
                for (let id = startId; id <= endId; id++) {
                    promises.push(
                        axios.get(`${POKEAPI_BASE_URL}/pokemon/${id}`)
                            .then(response => ({
                                id: response.data.id,
                                name: response.data.name,
                                types: response.data.types,
                                sprites: response.data.sprites
                            }))
                            .catch(() => null) // Handle individual Pokemon fetch errors
                    );
                }

                const results = await Promise.all(promises);
                pokemonData = results.filter(pokemon => pokemon !== null);
                setHasMore(endId < genData.endId);
            }

            if (append) {
                setPokemonList(prev => [...prev, ...pokemonData]);
            } else {
                setPokemonList(pokemonData);
            }

            setPage(pageNum);
        } catch (err) {
            setError('Failed to fetch Pokemon data');
            console.error('Error fetching Pokemon data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && hasMore && !searchTerm) {
            fetchPokemonData(generation, searchTerm, page + 1, true);
        }
    }, [loading, hasMore, searchTerm, generation, page, fetchPokemonData]);

    const searchPokemon = useCallback((term) => {
        setPage(1);
        setHasMore(false);
        if (term.trim()) {
            fetchPokemonData(generation, term, 1, false);
        } else {
            fetchPokemonData(generation, '', 1, false);
        }
    }, [generation, fetchPokemonData]);

    useEffect(() => {
        if (generation) {
            // Reset state when generation changes
            setPokemonList([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            fetchPokemonData(generation, searchTerm, 1, false);
        }
    }, [generation, searchTerm, fetchPokemonData]);

    return {
        pokemonList,
        loading,
        error,
        hasMore,
        loadMore,
        searchPokemon
    };
};
