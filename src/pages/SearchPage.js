import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import RecipeList from "../components/RecipeList";
import IngredientList from "../components/IngredientList";
import NutritionSummary from "../components/NutritionSummary";
import Pagination from "../components/Pagination";
import {
    searchRecipes,
    getRecipeInformation,
    getRecipeNutritionInformation,
} from "../api/recipesApi";

const PAGE_SIZE = 10; // how many results per page

/**
 * Clean up the Spoonacular summary:
 * - Keep HTML formatting (bold, etc.)
 * - Remove trailing "If you like this recipe..." with repeated links.
 */
function getCleanSummaryHtml(summary) {
    if (!summary) return "";

    let s = summary;

    const marker = "If you like this recipe";
    const idx = s.indexOf(marker);
    if (idx !== -1) {
        s = s.substring(0, idx).trim();
    }

    return s;
}

function SearchPage() {
    const [lastQuery, setLastQuery] = useState("");
    const [recipes, setRecipes] = useState([]); // RecipeDto[]
    const [meta, setMeta] = useState(null); // { offset, number, totalResults }
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingNutrition, setLoadingNutrition] = useState(false);
    const [error, setError] = useState("");

    const [selectedRecipe, setSelectedRecipe] = useState(null); // full RecipeDto with nutrition
    const [excludedIngredients, setExcludedIngredients] = useState([]); // ingredient names

    // Live query & suggestions
    const [liveQuery, setLiveQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const handleQueryChange = (value) => {
        setLiveQuery(value);
    };

    /** Helper to hard-reset suggestion state */
    const clearSuggestionsState = () => {
        setLiveQuery("");
        setSuggestions([]);
        setLoadingSuggestions(false);
    };

    // Debounced suggestions loading (not related to pagination; always offset=0, small number)
    useEffect(() => {
        const trimmed = liveQuery.trim();
        if (!trimmed || trimmed.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoadingSuggestions(true);

        const timeoutId = setTimeout(async () => {
            try {
                const data = await searchRecipes({
                    recipeName: trimmed,
                    addRecipeInformation: false,
                    offset: 0,
                    number: 5,
                });

                const titles = (data.results || []).map((r) => r.title);
                setSuggestions(titles);
            } catch (err) {
                console.error("Failed to fetch suggestions", err);
                setSuggestions([]);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timeoutId);
    }, [liveQuery]);

    /**
     * Fetch a specific page of results (by offset) for the current query.
     * Used by both the initial search and pagination controls.
     */
    const fetchPage = async (query, offset) => {
        setLoadingSearch(true);
        setError("");
        setRecipes([]);

        // When we go to a new page, it's reasonable to clear details selection
        setSelectedRecipe(null);
        setExcludedIngredients([]);

        try {
            const data = await searchRecipes({
                recipeName: query,
                addRecipeInformation: false,
                offset,
                number: PAGE_SIZE,
            });

            setRecipes(data.results || []);
            setMeta({
                offset: data.offset,
                number: data.number,
                totalResults: data.totalResults,
            });
        } catch (err) {
            console.error(err);
            setError("Failed to fetch recipes. Please try again.");
        } finally {
            setLoadingSearch(false);
        }
    };

    /** Main search triggered by:
     * - pressing Enter in SearchBar
     * - clicking the Search button
     * - clicking a suggestion
     */
    const handleSearch = async (query) => {
        setLastQuery(query);
        clearSuggestionsState(); // close dropdown + reset liveQuery

        await fetchPage(query, 0); // always start from first page
    };

    /** When user clicks a suggestion in the dropdown */
    const handleSelectSuggestion = async (suggestion) => {
        await handleSearch(suggestion);
    };

    /** When user clicks Prev / Next in pagination */
    const handlePageChange = async (newOffset) => {
        if (!lastQuery) return; // safety check
        await fetchPage(lastQuery, newOffset);
    };

    const handleSelectRecipe = async (recipe) => {
        setSelectedRecipe(null);
        setExcludedIngredients([]);
        setLoadingDetails(true);
        setError("");

        try {
            const data = await getRecipeInformation({
                recipeName: recipe.title,
                offset: 0,
                number: 1,
            });

            const detailed = (data.results && data.results[0]) || null;
            setSelectedRecipe(detailed);
        } catch (err) {
            console.error(err);
            setError("Failed to load recipe details.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleToggleExcludeIngredient = async (ingredientName) => {
        if (!selectedRecipe) return;

        const newExcluded = excludedIngredients.includes(ingredientName)
            ? excludedIngredients.filter((n) => n !== ingredientName)
            : [...excludedIngredients, ingredientName];

        setExcludedIngredients(newExcluded);

        try {
            setLoadingNutrition(true);
            const data = await getRecipeNutritionInformation({
                recipeName: selectedRecipe.title,
                ingredientsToExclude: newExcluded,
                offset: 0,
                number: 1,
            });

            const updated = (data.results && data.results[0]) || null;
            if (updated) {
                setSelectedRecipe((prev) =>
                    prev
                        ? {
                            ...prev,
                            totalCalories: updated.totalCalories,
                            nutrition: updated.nutrition,
                        }
                        : updated
                );
            }
        } catch (err) {
            console.error(err);
            setError("Failed to recalculate nutrition.");
        } finally {
            setLoadingNutrition(false);
        }
    };

    const cleanSummaryHtml = getCleanSummaryHtml(selectedRecipe?.summary);

    return (
        <div>
            <SearchBar
                onSearch={handleSearch}
                onQueryChange={handleQueryChange}
                initialValue={lastQuery}
                suggestions={suggestions}
                onSelectSuggestion={handleSelectSuggestion}
            />

            {loadingSuggestions &&
                liveQuery &&
                suggestions.length === 0 &&
                !loadingSearch && <p className="hint-text">Finding suggestions...</p>}

            {loadingSearch && <p>Loading recipes...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loadingSearch && !error && !lastQuery && (
                <p className="hint-text">
                    Try searching for something like “chicken” or “pasta”.
                </p>
            )}

            {!loadingSearch && !error && lastQuery && recipes.length === 0 && (
                <p>No recipes found for “{lastQuery}”.</p>
            )}

            {!loadingSearch && !error && recipes.length > 0 && (
                <div>
                    <p>
                        Showing {recipes.length} result(s) out of{" "}
                        {meta?.totalResults ?? recipes.length} for{" "}
                        <strong>{lastQuery}</strong>
                    </p>

                    {/* 🔹 Pagination controls */}
                    <Pagination
                        totalResults={meta?.totalResults || 0}
                        offset={meta?.offset || 0}
                        pageSize={meta?.number || PAGE_SIZE}
                        loading={loadingSearch}
                        onPageChange={handlePageChange}
                    />

                    <RecipeList recipes={recipes} onSelectRecipe={handleSelectRecipe} />
                </div>
            )}

            {loadingDetails && <p>Loading recipe details...</p>}

            {selectedRecipe && (
                <div className="details-panel">
                    <h2>{selectedRecipe.title}</h2>
                    <p className="recipe-meta">
                        {selectedRecipe.readyInMinutes && (
                            <span>{selectedRecipe.readyInMinutes} min · </span>
                        )}
                        {selectedRecipe.servings && (
                            <span>{selectedRecipe.servings} servings</span>
                        )}
                    </p>

                    {selectedRecipe.image && (
                        <img
                            src={selectedRecipe.image}
                            alt={selectedRecipe.title}
                            style={{
                                width: "100%",
                                maxWidth: "420px",
                                height: "auto",
                                borderRadius: "8px",
                                margin: "0.5rem 0",
                                display: "block",
                            }}
                        />
                    )}

                    {cleanSummaryHtml && (
                        <div
                            className="recipe-summary"
                            dangerouslySetInnerHTML={{ __html: cleanSummaryHtml }}
                        />
                    )}

                    <NutritionSummary recipe={selectedRecipe} />

                    <IngredientList
                        ingredients={selectedRecipe.nutrition?.ingredients || []}
                        excludedNames={excludedIngredients}
                        onToggleExclude={handleToggleExcludeIngredient}
                    />

                    {loadingNutrition && <p>Recalculating calories...</p>}
                </div>
            )}
        </div>
    );
}

export default SearchPage;
