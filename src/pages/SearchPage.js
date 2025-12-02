import React, { useState, useEffect, useRef } from "react";
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

/**
 * Convert an Axios error into a user-friendly message.
 * Handles:
 * - Spoonacular daily limit (402 Payment Required)
 * - Backend message field
 * - Network errors
 */
function getFriendlyError(err, fallbackMessage) {
    // Axios error with response from backend
    if (err && err.response && err.response.data) {
        const data = err.response.data;
        const rawMessage =
            typeof data.message === "string" && data.message.trim().length > 0
                ? data.message
                : null;

        // Detect Spoonacular daily limit by status or message content
        const status = err.response.status;
        const isQuotaError =
            status === 402 ||
            (rawMessage &&
                rawMessage.toLowerCase().includes("daily points limit"));

        if (isQuotaError) {
            return (
                "We’ve reached the daily usage limit for the recipe provider. " +
                "Please try again later (usually after the daily reset)."
            );
        }

        // Generic backend message
        if (rawMessage) {
            return rawMessage;
        }
    }

    // Network error: no response received
    if (err && err.request && !err.response) {
        return "Unable to reach the server. Please check your internet connection and try again.";
    }

    // Fallback if nothing else matched
    return fallbackMessage;
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

    // Ref for the details panel (to scroll to it)
    const detailsRef = useRef(null);
    // Only scroll when a new recipe is selected (not on every nutrition update)
    const [shouldScrollToDetails, setShouldScrollToDetails] = useState(false);

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
                // For suggestions, we don't want a big global error banner.
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
            setError(
                getFriendlyError(err, "Failed to fetch recipes. Please try again.")
            );
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

            // We want to scroll after loading a new recipe
            setShouldScrollToDetails(true);
        } catch (err) {
            console.error(err);
            setError(
                getFriendlyError(err, "Failed to load recipe details. Please try again.")
            );
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
                // We update selectedRecipe, but we do NOT set shouldScrollToDetails here
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
            setError(
                getFriendlyError(
                    err,
                    "Failed to recalculate nutrition. Please try again."
                )
            );
        } finally {
            setLoadingNutrition(false);
        }
    };

    const cleanSummaryHtml = getCleanSummaryHtml(selectedRecipe?.summary);

    // Scroll to details ONLY when a new recipe was selected (flag is true)
    useEffect(() => {
        if (selectedRecipe && shouldScrollToDetails && detailsRef.current) {
            detailsRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            // reset the flag so subsequent updates (like nutrition) don't scroll
            setShouldScrollToDetails(false);
        }
    }, [selectedRecipe, shouldScrollToDetails]);

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

            {/* 🔹 Global error banner */}
            {error && (
                <div className="error-banner" role="alert">
                    {error}
                </div>
            )}

            {loadingSearch && <p>Loading recipes...</p>}

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
                <div className="details-panel" ref={detailsRef}>
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
