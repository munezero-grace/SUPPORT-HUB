export const canGoPrevious = (currentPage: number) => currentPage > 1;

export const canGoNext = (currentPage: number, totalPages: number) => currentPage < totalPages;
