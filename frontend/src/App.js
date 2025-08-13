import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlatformerGame from "./components/PlatformerGame";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlatformerGame />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;