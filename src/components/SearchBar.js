import React, { useState, useEffect } from "react";

/**
 * SearchBar with suggestions (autocomplete).
 *
 * Props:
 * - onSearch(query): called when user submits the form or picks a suggestion.
 * - onQueryChange?(query): called on each input change so parent can fetch suggestions.
 * - initialValue: initial text to show in the input.
 * - suggestions: array of strings (recipe titles) to show below the input.
 * - onSelectSuggestion?(suggestion): called when user clicks a suggestion.
 */
function SearchBar({
                       onSearch,
                       onQueryChange,
                       initialValue = "",
                       suggestions = [],
                       onSelectSuggestion,
                   }) {
    const [query, setQuery] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);

    // Keep local query in sync if initialValue changes (e.g. when user searches)
    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    // If suggestions array becomes empty, close the dropdown
    useEffect(() => {
        if (!suggestions || suggestions.length === 0) {
            setIsOpen(false);
        }
    }, [suggestions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;
        setIsOpen(false); // close dropdown on commit
        onSearch(trimmed);
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Open dropdown when user types something non-empty
        setIsOpen(!!value.trim());

        if (onQueryChange) {
            onQueryChange(value);
        }
    };

    const handleFocus = () => {
        // If we already have suggestions and query has text, reopen dropdown on focus
        if (suggestions && suggestions.length > 0 && query.trim().length > 0) {
            setIsOpen(true);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setIsOpen(false); // close dropdown immediately

        if (onSelectSuggestion) {
            onSelectSuggestion(suggestion);
        } else {
            onSearch(suggestion);
        }
    };

    const hasSuggestions =
        isOpen &&
        suggestions &&
        suggestions.length > 0 &&
        query.trim().length > 0;

    return (
        <div className="search-bar-wrapper">
            <form className="search-form" onSubmit={handleSubmit}>
                <label htmlFor="recipe-search" className="sr-only">
                    Search recipes
                </label>

                <input
                    id="recipe-search"
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    placeholder="Search for recipes (e.g. chicken, pasta, salad)..."
                    className="search-input"
                    autoComplete="off"
                />

                <button type="submit" className="search-button">
                    Search
                </button>
            </form>

            {hasSuggestions && (
                <ul className="search-suggestions" aria-label="Search suggestions">
                    {suggestions.map((s) => (
                        <li
                            key={s}
                            className="search-suggestion-item"
                            onClick={() => handleSuggestionClick(s)}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
