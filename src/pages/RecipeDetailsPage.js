import React from "react";
import { useParams, Link } from "react-router-dom";

function RecipeDetailsPage() {
    const { id } = useParams(); // get /recipes/:id

    return (
        <div>
            <Link to="/" style={{ display: "inline-block", marginBottom: "1rem" }}>
                &larr; Back to search
            </Link>

            <h2>Recipe Details</h2>
            <p>Recipe ID from URL: {id}</p>
            <p>
                Later we will fetch recipe details (ingredients, calories, exclusions)
                from your backend using this ID.
            </p>
        </div>
    );
}

export default RecipeDetailsPage;
