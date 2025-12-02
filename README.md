# Recipe Finder – React Frontend

## Introduction

This project is the **React frontend** for the Recipe Application in the Atypon assessment.

The frontend:

- Provides a user interface to **search for recipes**.
- Shows **detailed recipe information**, including ingredients, total calories, and key nutrients.
- Allows users to **exclude ingredients** and see **updated calorie counts**.
- Handles **pagination** when a large number of results are returned.
- Shows **clear error messages**, including when the external Spoonacular API daily limit is reached.

The React app communicates **only** with the Spring Boot backend under `/api/recipes/...`.  
The backend is the only component that talks to the Spoonacular API and holds the API key.

---

## Setup Instructions

These instructions describe how to run **only the React frontend** using the command line (no specific IDE required).

### Prerequisites

Before starting, make sure you have:

- **Node.js** (LTS version recommended)
- **npm** (installed automatically with Node.js)
- The **Spring Boot backend** running and accessible at:

    - `http://localhost:8080`

The backend should:

- Be configured with a valid Spoonacular API key.
- Expose at least the following endpoints:
    - `GET /api/recipes/search`
    - `GET /api/recipes/information`
    - `GET /api/recipes/nutrition/info`

### Steps to Run the React Frontend

1. **Start the backend**

    - Run the Spring Boot backend so it listens on `http://localhost:8080`.
    - Confirm that the recipe endpoints under `/api/recipes/...` are working.

2. **Open a terminal**

    - Use Command Prompt, PowerShell, or any terminal of your choice.

3. **Navigate to the React project directory**

    - Change directory into the React app folder (for example):

      ```bash
      cd path/to/your/project/recipe-ui
      ```

    - This folder should contain a `package.json` file.

4. **Install dependencies**

    - Install all Node.js packages required by the React app:

      ```bash
      npm install
      ```

    - This reads `package.json` and downloads all necessary dependencies (React, Axios, etc.).

5. **Ensure backend proxy configuration**

    - The React app is configured to forward any request starting with `/api` to `http://localhost:8080`.
    - This means the frontend calls URLs like `/api/recipes/search`, and they are automatically sent to the Spring Boot backend.
    - No manual changes are usually required here, just ensure the backend is running on the correct port.

6. **Start the React development server**

    - From the same `recipe-ui` directory, start the app in development mode:

      ```bash
      npm start
      ```

    - This launches the React development server (by default on `http://localhost:3000`).

7. **Open the application in the browser**

    - If the browser does not open automatically, open it manually and go to:

        - `http://localhost:3000`

8. **Use the application**

    - Type a search term such as “chicken” or “pasta” in the search bar.
    - Suggestions will appear as you type.
    - Press Enter, click the search button, or click a suggestion to perform a search.
    - A grid of recipes will appear; click a recipe to scroll down to its detailed view.
    - In the details section:
        - Review the summary, total calories, and key nutrients.
        - Use the ingredient checkboxes to **exclude** ingredients and see the **Total calories** update.
    - Use **Previous** and **Next** buttons if there are multiple pages of results.
    - If the Spoonacular daily limit is reached or the backend is unavailable, a clear error message will be shown instead of raw error text.

---

## Design Decisions (Frontend)

### 1. Single-Page React Application (No Routing)

The entire required workflow fits naturally on **one screen**:

- Search → View results → Select recipe → View details → Exclude ingredients.

Because of this, the frontend is implemented as a **single-page React application** without client-side routing:

- One main container component manages:
    - Search query and results.
    - Pagination data.
    - Selected recipe and its nutrition information.
    - Excluded ingredients.
    - Loading and error states.
    - Live suggestions for the search bar.
- Smaller child components handle only specific UI parts:
    - Search bar and suggestions dropdown.
    - Recipe list and recipe cards.
    - Nutrition summary.
    - Ingredient list with checkboxes.
    - Pagination controls.

This design keeps the architecture simple, easier to debug, and fully sufficient for the assessment requirements.

### 2. State Management with React Hooks

State is managed using **React hooks** (`useState`, `useEffect`) in the main page component.

The main component stores:

- The last committed search term.
- The list of recipes returned by the backend.
- Pagination information: offset, page size, total results.
- The currently selected recipe (with nutrition details).
- A list of ingredient names that are excluded.
- Loading flags for:
    - Searching recipes.
    - Loading recipe details.
    - Recalculating nutrition.
- Error messages to display in the UI.
- Live input value and suggestion list for the search bar.

Child components are **stateless** with respect to application logic:

- They receive data and callbacks from the parent.
- They do not manage global or shared application state themselves.

No global state library (like Redux) is used, because:

- All necessary state belongs to one page.
- React hooks provide a simple and clear solution for this scale.

### 3. Communication with the Backend

The React app **never** calls Spoonacular directly. Instead:

- All recipe and nutrition data is fetched from the Spring Boot backend.
- The frontend uses a small internal “API layer” to call:
    - The search endpoint.
    - The recipe information endpoint.
    - The nutrition recalculation endpoint.

This approach:

- Keeps the Spoonacular API key and details hidden on the server side.
- Centralizes HTTP logic so components do not need to know URL structures.
- Makes it easier to adapt the frontend if the backend’s implementation changes.

### 4. UX and Interaction Design

Several UX choices were made for clarity and ease of use:

- **Search suggestions**
    - Suggestions are fetched after a short delay and with a minimum input length to avoid excessive calls.
    - The suggestion dropdown closes when:
        - A suggestion is clicked, or
        - A search is manually committed.
- **Results and pagination**
    - Results are displayed in a responsive grid.
    - A short summary shows how many results are displayed out of the total.
    - Pagination uses the backend’s offset and total to move through result pages.
- **Details panel and scrolling**
    - When a recipe is selected, and the details are loaded, the page scrolls smoothly down to the details section.
    - This makes the transition from search results to details clear and intentional.
- **Highlighting total calories**
    - Total calories are shown in a visually emphasized area (color and font size).
    - When ingredients are excluded, this value updates and naturally draws the user’s attention.
- **Ingredient layout**
    - Ingredients are displayed as horizontal “pills” that wrap across lines.
    - Each pill includes a checkbox, name, amount/unit, and calories when available.
    - Excluded ingredients appear visually different (e.g., faded or with strikethrough) to indicate they are not counted.
- **Error handling**
    - Errors are shown in a banner with clear, friendly messages.
    - Technical details are hidden from the user.
    - Specific support is implemented for:
        - Spoonacular daily usage limit.
        - Network failures.
        - Generic backend errors.

---

## AI Usage Reflection

The assessment explicitly encourages using AI to assist with boilerplate and repetitive tasks, but also requires validating and challenging AI-generated output. This approach was followed for the React frontend.

### How AI Was Used

AI was used to:

- Propose the initial **component structure**:
    - Main container, search bar, recipe list, details, ingredients, pagination.
- Suggest patterns for:
    - Organizing a simple frontend API layer to talk to the backend.
    - Implementing pagination based on offset and page size.
    - Handling search suggestions and debouncing requests.
    - Cleaning up summary text that contains HTML.
- Help draft and refine this **README**:
    - Section structure.
    - Wording for design decisions, AI reflection, and lessons learned.

This reduced the time spent on boilerplate and documentation structure.

### How AI Output Was Challenged and Adjusted

AI suggestions were reviewed and adapted based on actual behavior and the real backend:

- **Routing and complexity**
    - Early AI suggestions included a router with multiple pages.
    - This added unnecessary complexity and caused hook-related issues.
    - After testing, the design was simplified to a single-page layout, which better matched the requirements.

- **Backend contract alignment**
    - AI initially assumed generic field names and response formats.
    - The actual Spring Boot backend uses specific DTOs and field names (e.g. `recipeName`, `offset`, `number`, `totalResults`, `totalCalories`).
    - The frontend was adjusted to use the real contract and correctly handle nested nutrition/ingredient structures.

- **Suggestions dropdown behavior**
    - The first implementation left the dropdown open after a suggestion was clicked.
    - This was corrected by explicitly tracking when the dropdown should be open and closing it after a suggestion or search action.

- **Layout and spacing**
    - Some initial styling caused visual issues (e.g. stretched images, content too close to the bottom).
    - Through manual testing, image sizing and extra spacing were tuned for a cleaner layout.

- **Error handling and quota messages**
    - When the Spoonacular daily limit was reached, the backend returned a technical error message.
    - Instead of showing raw JSON, the frontend was updated to:
        - Detect this specific case.
        - Show a clear, user-friendly message about daily usage limits.

In summary, AI was used as an assistant for speed and ideas, but final behavior and structure were validated and refined based on real tests and understanding of the system.

---

## Lessons Learned and Highlights

### Lessons Learned

- **Start with the simplest architecture that meets the requirements.**
    - A single-page app with local state management was enough for this assessment and easier to implement and debug than a multi-route setup.

- **React hooks are powerful for localized state.**
    - For a single screen with well-defined responsibilities, `useState` and `useEffect` provide a clear and maintainable state management approach.

- **AI is a tool, not a replacement for reasoning.**
    - AI helped with scaffolding and documentation but needed validation against:
        - The real backend API.
        - Actual runtime behavior in the browser.
        - UX expectations for end users.

- **Error handling is part of the user experience.**
    - Transforming technical errors (like API quota exceeded) into human-readable messages significantly improves the overall feel of the application.

### Highlights

- The React frontend delivers a **complete and coherent user flow**:
    - Search for recipes, page through large result sets, inspect detailed nutrition, and interactively exclude ingredients.
- The UI is **clean, responsive, and purposeful**, focusing on clarity and usability.
- The app handles external limitations (API quotas) and backend issues gracefully with clear feedback.
- The current structure can be extended in future:
    - New filters and sorting options.
    - Additional nutrient visualizations.
    - Optional client-side routing if more screens are introduced.

This README documents how to set up and run the React app, explains key design decisions, reflects on AI usage, and summarizes important lessons and highlights from building the frontend.
