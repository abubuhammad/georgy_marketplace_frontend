import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Welcome to
              <span className="block text-yellow-300">Georgy's Marketplace</span>
            </h1>
            <p className="text-xl mb-6 text-red-100">
              Discover amazing deals on electronics, fashion, home goods and more!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-yellow-400 hover:bg-yellow-500 text-red-700 font-bold"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-red-600"
              >
                View Categories
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-400 rounded-lg p-4 text-red-700">
                  <h3 className="font-bold text-lg">Flash Sale</h3>
                  <p className="text-sm">Up to 70% Off</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg">Free Delivery</h3>
                  <p className="text-sm">On orders over ₦10,000</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg">24/7 Support</h3>
                  <p className="text-sm">Customer service</p>
                </div>
                <div className="bg-yellow-400 rounded-lg p-4 text-red-700">
                  <h3 className="font-bold text-lg">Secure Pay</h3>
                  <p className="text-sm">100% Protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;