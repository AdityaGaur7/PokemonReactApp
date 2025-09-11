# Pokemon React App (Generation-wise with Lazy Loading)

A modern, fast React + Vite application to explore Pokemon generation-wise with lazy loading, infinite scroll, search, detail pages, and a monochromatic dark theme. Uses the public PokeAPI for data and Pokemon Showdown animated GIF sprites for visuals.

## Features

- Generation-wise browsing (Gen I–IX) with accurate ID ranges
- Infinite scroll + lazy loaded cards (IntersectionObserver)
- Search by name or ID within the selected generation
- Detail page per Pokemon with comprehensive info
  - Types, base stats (with bars), abilities, moves, game appearances, held items, sprites
- Animated sprites via Pokemon Showdown GIFs
- Monochromatic dark theme (black/white/gray) with green accents
- Robust loading and error states

## Tech Stack

- React 18 + Vite
- React Router v6
- Axios for API calls
- CSS (no CSS framework) with responsive layout

## APIs and Assets

- Data: `https://pokeapi.co/api/v2` ([PokeAPI](https://pokeapi.co))
- Animated Sprites: `https://play.pokemonshowdown.com/sprites/ani/*.gif`

Example reference data used when building detail views: [Ditto JSON](https://pokeapi.co/api/v2/pokemon/ditto)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:

   ```bash
   npm run dev
   ```

   Open the printed localhost URL (e.g., http://localhost:5173 or :5174 if ports shift).

3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build:
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
  components/
    GenerationSelector.jsx   # Generation selection UI
    InfiniteScroll.jsx       # Observer trigger for lazy loading
    PokemonCard.jsx          # Lazy-loaded card with animated GIF
    PokemonDetail.jsx        # Full detail view per Pokemon
    PokemonSearch.jsx        # Search by name/ID
  constants/
    pokemonGenerations.js    # Gen ranges + API constants
  hooks/
    usePokemonData.js        # List fetching, paging, search
    usePokemonDetail.js      # Detail data fetching
  proj/
    Nine.jsx                 # Main page (listing view)
  App.jsx                    # Routes
  App.css                    # Monochromatic dark theme styles
  main.jsx                   # Router + App bootstrap
```

## Key UX Details

- Cards and detail page images use Pokemon Showdown GIFs for a lively experience
- Fallbacks to official-artwork/front_default when GIFs 404
- Pixel-art friendly rendering via `image-rendering: pixelated`
- Green accents (#4caf50) for interactive elements; subtle grays for surfaces/borders

## Customization

- Update generation ranges or constants in `src/constants/pokemonGenerations.js`
- Tweak theme in `src/App.css` (colors, spacing, badges, stat bars)

## Notes

- Public APIs may throttle; loading states and fallbacks are implemented
- If a GIF is missing for a form/name, the code gracefully falls back to PokeAPI sprites

## License

This project is for educational/demo purposes. Check respective API/image providers for their terms.
