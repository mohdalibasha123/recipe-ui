import React from "react";
import RecipeCard from "./RecipeCard";

function RecipeList({ recipes, onSelectRecipe }) {
    if (!recipes || recipes.length === 0) {
        return null;
    }

    return (
        <section style={{ marginTop: "1rem" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "0.75rem",
                }}
            >
                {recipes.map((r) => (
                    <RecipeCard key={r.id || r.title} recipe={r} onSelect={onSelectRecipe} />
                ))}
            </div>
        </section>
    );
}

export default RecipeList;
