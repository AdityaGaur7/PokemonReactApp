import { useState, useEffect } from 'react';
import axios from 'axios';
import { POKEAPI_BASE_URL } from '../constants/pokemonGenerations';

export const usePokemonDetail = (pokemonId) => {
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            if (!pokemonId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${pokemonId}`);
                setPokemon(response.data);
            } catch (err) {
                setError('Failed to fetch Pokemon details');
                console.error('Error fetching Pokemon details:', err);
                setPokemon(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPokemonDetails();
    }, [pokemonId]);

    return { pokemon, loading, error };
};
