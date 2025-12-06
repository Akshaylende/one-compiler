import React from "react";
import { createRoot } from "react-dom/client";
import Compiler from "./Compiler.jsx";
import "./style.css";

const App = () => {
    return (
        <div className="app-container">
            <Compiler />
        </div>
    );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);