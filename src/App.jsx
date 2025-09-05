import "./App.css";
import { Routes, Route } from "react-router-dom";
import Nine from "./proj/Nine";
import PokemonDetail from "./components/PokemonDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Nine />} />
      <Route path="/pokemon/:id" element={<PokemonDetail />} />
    </Routes>
  );
}

export default App;
