import React from "react";

/**
 * Simple pagination controls.
 *
 * Props:
 * - totalResults: total number of results from backend
 * - offset: current offset
 * - pageSize: number of results per page
 * - loading: whether a page is currently loading (disables buttons)
 * - onPageChange(newOffset): called when user clicks Prev/Next
 */
function Pagination({ totalResults, offset, pageSize, loading, onPageChange }) {
    if (!totalResults || totalResults <= pageSize) {
        return null; // no need for pagination if everything fits in one page
    }

    const currentPage = Math.floor(offset / pageSize) + 1;
    const totalPages = Math.ceil(totalResults / pageSize);

    const canPrev = currentPage > 1;
    const canNext = currentPage < totalPages;

    const handlePrev = () => {
        if (!canPrev || loading) return;
        const newOffset = Math.max(0, offset - pageSize);
        onPageChange(newOffset);
    };

    const handleNext = () => {
        if (!canNext || loading) return;
        const newOffset = offset + pageSize;
        onPageChange(newOffset);
    };

    return (
        <div className="pagination">
            <button
                type="button"
                onClick={handlePrev}
                disabled={!canPrev || loading}
                className="pagination-button"
            >
                Previous
            </button>

            <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>

            <button
                type="button"
                onClick={handleNext}
                disabled={!canNext || loading}
                className="pagination-button"
            >
                Next
            </button>
        </div>
    );
}

export default Pagination;
