import React from "react";

function RecipeCard({ recipe, onSelect }) {
    const handleClick = () => {
        onSelect(recipe);
    };

    return (
        <article
            onClick={handleClick}
            style={{
                display: "flex",
                gap: "0.75rem",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #eee",
                cursor: "pointer",
                backgroundColor: "#fff",
            }}
        >
            {recipe.image && (
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        flexShrink: 0,
                    }}
                />
            )}
            <div>
                <h3 style={{ margin: "0 0 0.25rem 0" }}>{recipe.title}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
                    {recipe.readyInMinutes && (
                        <span>{recipe.readyInMinutes} min · </span>
                    )}
                    {recipe.servings && <span>{recipe.servings} servings · </span>}
                    {recipe.totalCalories && (
                        <span>{Math.round(recipe.totalCalories)} kcal</span>
                    )}
                </p>
            </div>
        </article>
    );
}

export default RecipeCard;
