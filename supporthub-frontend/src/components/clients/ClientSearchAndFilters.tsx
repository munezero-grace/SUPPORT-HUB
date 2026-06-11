import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface ClientSearchAndFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

const ClientSearchAndFilters = ({
  searchQuery,
  onSearchChange,
}: ClientSearchAndFiltersProps) => {
  return (
    <div className="flex p-4">
      <div className="relative flex-grow">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-amber-950 focus:ring-1"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50 ml-4">
        <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
        Filters
      </button>
    </div>
  )
}

export default ClientSearchAndFilters
