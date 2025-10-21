import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Category[];
}

interface CategoryNavProps {
  onCategorySelect?: (category: Category) => void;
  className?: string;
}

const categories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    subcategories: [
      { id: 'phones', name: 'Phones & Tablets', icon: '📱' },
      { id: 'computers', name: 'Computers & Laptops', icon: '💻' },
      { id: 'audio', name: 'Audio & Headphones', icon: '🎧' },
      { id: 'cameras', name: 'Cameras & Photography', icon: '📷' }
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👕',
    subcategories: [
      { id: 'mens', name: "Men's Clothing", icon: '👔' },
      { id: 'womens', name: "Women's Clothing", icon: '👗' },
      { id: 'shoes', name: 'Shoes & Footwear', icon: '👟' },
      { id: 'accessories', name: 'Accessories', icon: '👜' }
    ]
  },
  {
    id: 'home',
    name: 'Home & Garden',
    icon: '🏠',
    subcategories: [
      { id: 'furniture', name: 'Furniture', icon: '🪑' },
      { id: 'decor', name: 'Home Decor', icon: '🖼️' },
      { id: 'kitchen', name: 'Kitchen & Dining', icon: '🍽️' },
      { id: 'garden', name: 'Garden & Outdoor', icon: '🌱' }
    ]
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    icon: '⚽',
    subcategories: [
      { id: 'fitness', name: 'Fitness Equipment', icon: '🏋️' },
      { id: 'outdoor', name: 'Outdoor Sports', icon: '🏃' },
      { id: 'team', name: 'Team Sports', icon: '⚽' },
      { id: 'water', name: 'Water Sports', icon: '🏊' }
    ]
  },
  {
    id: 'books',
    name: 'Books & Media',
    icon: '📚',
    subcategories: [
      { id: 'fiction', name: 'Fiction', icon: '📖' },
      { id: 'education', name: 'Educational', icon: '📚' },
      { id: 'media', name: 'Movies & Music', icon: '🎬' },
      { id: 'magazines', name: 'Magazines', icon: '📰' }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Health',
    icon: '💄',
    subcategories: [
      { id: 'skincare', name: 'Skincare', icon: '🧴' },
      { id: 'makeup', name: 'Makeup', icon: '💄' },
      { id: 'health', name: 'Health & Wellness', icon: '💊' },
      { id: 'fragrance', name: 'Fragrance', icon: '🌸' }
    ]
  }
];

const CategoryNav: React.FC<CategoryNavProps> = ({ onCategorySelect, className }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <nav className={cn('bg-white border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleCategoryHover(category.id)}
                onMouseLeave={handleCategoryLeave}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  {category.subcategories && (
                    <ChevronDown size={16} className="ml-1" />
                  )}
                </Button>
                
                {/* Subcategory dropdown */}
                {activeCategory === category.id && category.subcategories && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                          onClick={() => handleCategoryClick(subcategory)}
                        >
                          <span className="text-lg">{subcategory.icon}</span>
                          <span className="text-sm text-gray-700">{subcategory.name}</span>
                          <ChevronRight size={14} className="ml-auto text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-red-600">
              View All Categories
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;