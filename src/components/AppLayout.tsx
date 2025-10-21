import React, { useState } from 'react';
import Header from './Header';
import CategoryNav from './CategoryNav';
import HeroBanner from './HeroBanner';
import ProductGrid from './ProductGrid';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={toggleSidebar} />
      <CategoryNav />
      <HeroBanner />
      
      <main>
        <ProductGrid title="Flash Sales" />
        <ProductGrid title="Top Deals" />
        <ProductGrid title="Recommended for You" />
      </main>
      
      <Footer />
    </div>
  );
};

export default AppLayout;