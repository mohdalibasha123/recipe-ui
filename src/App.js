import React from "react";
import SearchPage from "./pages/SearchPage";

function App() {
    return (
        <div className="app-container">
            <header style={{ marginBottom: "2rem" }}>
                <h1>Recipe Finder</h1>
                <p style={{ color: "#555" }}>
                    Search recipes and view nutritional information via your Spring Boot
                    backend.
                </p>
            </header>

            <SearchPage />
        </div>
    );
}

export default App;
