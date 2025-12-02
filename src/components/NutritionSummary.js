import React from "react";

function findCalories(nutrients) {
    if (!nutrients) return null;
    const cal = nutrients.find(
        (n) => n.name && n.name.toLowerCase() === "calories"
    );
    return cal ? cal.amount : null;
}

function NutritionSummary({ recipe }) {
    if (!recipe) return null;

    const totalCalories = recipe.totalCalories;
    const nutrients = recipe.nutrition?.nutrients || [];
    const caloriesFromNutrients = findCalories(nutrients);

    const topNutrients = nutrients.slice(0, 5); // show a few

    return (
        <section
            style={{
                marginTop: "1rem",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #eee",
                backgroundColor: "#fafafa",
            }}
        >
            <h3>Nutrition</h3>
            {totalCalories != null && (
                <p style={{ margin: "0 0 0.5rem 0" }}>
                    <strong>Total calories:</strong> {Math.round(totalCalories)} kcal
                </p>
            )}
            {caloriesFromNutrients != null && totalCalories != null && (
                <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#555" }}>
                    (Calories from nutrients list: {Math.round(caloriesFromNutrients)} kcal)
                </p>
            )}

            {topNutrients.length > 0 && (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.85rem",
                    }}
                >
                    <thead>
                    <tr>
                        <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                            Nutrient
                        </th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>
                            Amount
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {topNutrients.map((n) => (
                        <tr key={n.name}>
                            <td style={{ padding: "0.25rem 0" }}>{n.name}</td>
                            <td style={{ padding: "0.25rem 0", textAlign: "right" }}>
                                {n.amount} {n.unit}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}

export default NutritionSummary;
