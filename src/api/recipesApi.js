import client from "./client";

/**
 * Search recipes
 * GET /api/recipes/search
 * Binds to RecipeSearchReq on backend.
 */
export const searchRecipes = async ({
                                        recipeName,
                                        addRecipeInformation = true,
                                        offset = 0,
                                        number = 10,
                                        intolerances,
                                        sort,
                                        sortDirection,
                                    } = {}) => {
    const params = {
        recipeName,          // maps to RecipeSearchReq.recipeName
        addRecipeInformation,
        offset,
        number,
        sort,
        sortDirection,
    };

    if (intolerances && intolerances.length > 0) {
        params.intolerances = intolerances;
    }

    const response = await client.get("/recipes/search", { params });
    // response.data is RecipeSearchRes: { results, offset, number, totalResults }
    return response.data;
};

/**
 * Get detailed recipe information (with nutrition)
 * GET /api/recipes/information
 * Binds to RecipeInformationReq (extends RecipeSearchReq)
 */
export const getRecipeInformation = async ({
                                               recipeName,
                                               offset = 0,
                                               number = 1,
                                               intolerances,
                                               sort,
                                               sortDirection,
                                           } = {}) => {
    const params = {
        recipeName,
        offset,
        number,
        sort,
        sortDirection,
    };

    if (intolerances && intolerances.length > 0) {
        params.intolerances = intolerances;
    }

    const response = await client.get("/recipes/information", { params });
    return response.data; // RecipeSearchRes
};

/**
 * Get nutrition info with excluded ingredients
 * GET /api/recipes/nutrition/info
 * Binds to RecipeNutritionInformationReq
 */
export const getRecipeNutritionInformation = async ({
                                                        recipeName,
                                                        ingredientsToExclude = [],
                                                        offset = 0,
                                                        number = 1,
                                                        intolerances,
                                                        sort,
                                                        sortDirection,
                                                    } = {}) => {
    const params = {
        recipeName,
        offset,
        number,
        sort,
        sortDirection,
    };

    if (intolerances && intolerances.length > 0) {
        params.intolerances = intolerances;
    }

    if (ingredientsToExclude && ingredientsToExclude.length > 0) {
        // Spring can bind to Set<String> ingredientsToExclude
        params.ingredientsToExclude = ingredientsToExclude;
    }

    const response = await client.get("/recipes/nutrition/info", { params });
    return response.data; // RecipeSearchRes
};
