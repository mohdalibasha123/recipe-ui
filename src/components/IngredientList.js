import React from "react";

/**
 * Vertical list of ingredients with checkboxes.
 *
 * Props:
 * - ingredients: array of Ingredient { id, name, amount, unit, nutrients }
 * - excludedNames: array of ingredient names that are currently excluded
 * - onToggleExclude(name): called when user toggles checkbox
 */
function IngredientList({ ingredients, excludedNames, onToggleExclude }) {
    if (!ingredients || ingredients.length === 0) {
        return <p className="hint-text">No ingredient data available for this recipe.</p>;
    }

    const isExcluded = (name) => excludedNames.includes(name);

    const getIngredientCalories = (ingredient) => {
        if (!ingredient.nutrients) return null;
        const cal = ingredient.nutrients.find((n) => n.name === "Calories");
        return cal ? Math.round(cal.amount) : null;
    };

    return (
        <section>
            <h3>Ingredients</h3>
            <p className="hint-text">
                Uncheck ingredients to exclude them from the total calories.
            </p>

            <ul className="ingredients-list">
                {ingredients.map((ing) => {
                    const excluded = isExcluded(ing.name);
                    const calories = getIngredientCalories(ing);

                    return (
                        <li
                            key={ing.id ?? ing.name}
                            className={`ingredient-item ${excluded ? "excluded" : ""}`}
                        >
                            <label className="ingredient-row">
                                <input
                                    type="checkbox"
                                    checked={!excluded}
                                    onChange={() => onToggleExclude(ing.name)}
                                />

                                <div className="ingredient-main">
                                    <span className="ingredient-name">{ing.name}</span>
                                    <span className="ingredient-amount">
                    {ing.amount} {ing.unit}
                  </span>
                                </div>

                                {calories !== null && (
                                    <span className="ingredient-calories">
                    {calories} kcal
                  </span>
                                )}
                            </label>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

export default IngredientList;
