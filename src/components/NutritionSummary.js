import React from "react";

/**
 * NutritionSummary
 *
 * Props:
 * - recipe: RecipeDto with totalCalories and nutrition.nutrients
 */
function NutritionSummary({ recipe }) {
    if (!recipe) return null;

    const nutrients = recipe.nutrition?.nutrients || [];

    // Prefer recipe.totalCalories, fallback to "Calories" nutrient if needed
    let totalCalories = recipe.totalCalories;
    if ((totalCalories === null || totalCalories === undefined) && nutrients.length > 0) {
        const cal = nutrients.find((n) => n.name === "Calories");
        totalCalories = cal ? cal.amount : undefined;
    }

    const roundedCalories =
        totalCalories !== null && totalCalories !== undefined
            ? Math.round(totalCalories)
            : null;

    // Show just a few key nutrients besides calories
    const importantNutrients = ["Protein", "Fat", "Carbohydrates"];
    const keyNutrients = nutrients.filter((n) =>
        importantNutrients.includes(n.name)
    );

    return (
        <section className="nutrition-summary">
            {/* 🔥 Highlighted total calories card */}
            <div className="nutrition-total">
                <span className="nutrition-total-label">Total calories</span>
                {roundedCalories !== null ? (
                    <span className="nutrition-total-value">
            {roundedCalories} kcal
          </span>
                ) : (
                    <span className="nutrition-total-value">N/A</span>
                )}
            </div>

            {keyNutrients.length > 0 && (
                <div className="nutrition-grid">
                    {keyNutrients.map((n) => (
                        <div key={n.name} className="nutrition-item">
                            <div className="nutrition-item-name">{n.name}</div>
                            <div className="nutrition-item-value">
                                {Math.round(n.amount)} {n.unit}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default NutritionSummary;
