'use client'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { SearchAndFiltersProps } from '@/types/interfaces/form'


const SearchAndFilters = ({
    searchQuery,
    onSearchChange,
    onFilterClick,
    placeholder = 'Search...'
}: SearchAndFiltersProps) => {
    return (<div className="px-4 py-2 flex items-center gap-4">
        <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder={placeholder}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className="relative">
            <button
                onClick={onFilterClick}
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
                <span>Filter</span>
            </button>
        </div>
    </div>
    )
}

export default SearchAndFilters
