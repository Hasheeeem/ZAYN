import React from 'react';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  filters?: {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    label: string;
  }[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchPlaceholder,
  onSearch,
  filters
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      {filters && filters.map((filter, index) => (
        <div key={index} className="min-w-[150px]">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default SearchFilter;