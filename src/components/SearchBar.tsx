import React, { useState } from 'react';
import { Search, Filter } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "What are you looking for?",
  showFilters = true,
  className
}) => {
  const [query, setQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('relative w-full max-w-4xl', className)}>
      <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            icon={Search}
            iconPosition="left"
            className="border-none shadow-none pr-4"
            fullWidth
          />
        </div>
        
        {showFilters && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={Filter}
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="mx-2"
            >
              Filters
            </Button>
            
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="font-semibold mb-3">Filter by Category</h3>
                  <div className="space-y-2">
                    {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Price Range</h4>
                    <div className="flex items-center space-x-2">
                      <Input type="number" placeholder="Min" size="sm" />
                      <span>-</span>
                      <Input type="number" placeholder="Max" size="sm" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowFilterMenu(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setShowFilterMenu(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <Button
          onClick={handleSearch}
          className="rounded-l-none"
          size="sm"
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;