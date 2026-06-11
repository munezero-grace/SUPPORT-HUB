export interface SelectOption {
  label: string;
  value: string;
}


export interface SearchAndFiltersProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    onFilterClick?: () => void
    placeholder?: string
}