import React from "react";

function Layout({ children }) {
    return (
        <div
            style={{
                padding: "1.5rem",
                fontFamily: "system-ui, sans-serif",
                maxWidth: "960px",
                margin: "0 auto",
            }}
        >
            <header style={{ marginBottom: "2rem" }}>
                <h1>Recipe Finder</h1>
                <p style={{ color: "#555" }}>
                    Search recipes and view nutritional information via your Spring Boot
                    backend (Spoonacular behind the scenes).
                </p>
            </header>

            <main>{children}</main>

            <footer
                style={{
                    marginTop: "2rem",
                    fontSize: "0.85rem",
                    color: "#777",
                }}
            >
                Powered by Spoonacular · Atypon Assessment
            </footer>
        </div>
    );
}

export default Layout;
