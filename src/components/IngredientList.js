import React from "react";

function getIngredientCalories(ingredient) {
    if (!ingredient?.nutrients) return null;
    const cal = ingredient.nutrients.find(
        (n) => n.name && n.name.toLowerCase() === "calories"
    );
    return cal ? cal.amount : null;
}

function IngredientList({ ingredients, excludedNames, onToggleExclude }) {
    if (!ingredients || ingredients.length === 0) {
        return <p>No ingredient data available.</p>;
    }

    return (
        <section style={{ marginTop: "1rem" }}>
            <h3>Ingredients</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {ingredients.map((ing) => {
                    const isExcluded = excludedNames.includes(ing.name);
                    const calories = getIngredientCalories(ing);

                    return (
                        <li
                            key={ing.id || ing.name}
                            style={{
                                padding: "0.35rem 0.25rem",
                                borderBottom: "1px solid #eee",
                                opacity: isExcluded ? 0.5 : 1,
                            }}
                        >
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input
                                    type="checkbox"
                                    checked={isExcluded}
                                    onChange={() => onToggleExclude(ing.name)}
                                />
                                <div>
                                    <div style={{ fontWeight: 500 }}>{ing.name}</div>
                                    <div style={{ fontSize: "0.85rem", color: "#555" }}>
                                        {ing.amount} {ing.unit}
                                        {calories != null && ` · ${Math.round(calories)} kcal`}
                                    </div>
                                </div>
                            </label>
                        </li>
                    );
                })}
            </ul>
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                Uncheck ingredients to exclude them from the calorie calculation.
            </p>
        </section>
    );
}

export default IngredientList;
