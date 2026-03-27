import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/pages/home";
import RegisterForm from "./components/pages/RegisterForm";
import Sign_In from "./components/pages/Sign_In";
import ListPatients from "./components/pages/ListPatients";
import { useState } from "react";

function App() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("medidigt_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Mettre à jour l'état quand un nouveau patient est ajouté (optionnel si vous rechargez la page)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Sign_In />} />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/patients"
          element={
            <ListPatients
              history={history}
              onClear={() => {
                localStorage.removeItem("medidigt_history");
                setHistory([]);
              }}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
