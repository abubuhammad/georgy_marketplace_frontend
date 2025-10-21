import React from 'react';
import ProductCard from './ProductCard';

const mockProducts = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    price: 850000,
    originalPrice: 950000,
    image: '/placeholder.svg',
    rating: 5,
    reviews: 128,
    discount: 11
  },
  {
    id: '2',
    name: 'Apple iPhone 15 Pro Max 512GB',
    price: 1200000,
    originalPrice: 1350000,
    image: '/placeholder.svg',
    rating: 5,
    reviews: 89,
    discount: 11
  },
  {
    id: '3',
    name: 'Nike Air Max 270 Running Shoes',
    price: 45000,
    originalPrice: 55000,
    image: '/placeholder.svg',
    rating: 4,
    reviews: 234,
    discount: 18
  },
  {
    id: '4',
    name: 'MacBook Pro 14-inch M3 Chip',
    price: 1800000,
    image: '/placeholder.svg',
    rating: 5,
    reviews: 67
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5 Headphones',
    price: 180000,
    originalPrice: 220000,
    image: '/placeholder.svg',
    rating: 5,
    reviews: 156,
    discount: 18
  },
  {
    id: '6',
    name: 'LG 55" OLED Smart TV',
    price: 650000,
    originalPrice: 750000,
    image: '/placeholder.svg',
    rating: 4,
    reviews: 98,
    discount: 13
  }
];

interface ProductGridProps {
  title: string;
  showAll?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ title, showAll = false }) => {
  const products = showAll ? mockProducts : mockProducts.slice(0, 6);
  
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button className="text-red-600 hover:text-red-700 font-medium">
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;