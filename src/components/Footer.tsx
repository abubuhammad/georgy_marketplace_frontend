import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-400">
              Georgy Marketplace
            </h3>
            <p className="text-gray-300 mb-4">
              Your trusted online marketplace for quality products at amazing prices.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-red-400">About Us</a></li>
              <li><a href="#" className="hover:text-red-400">Contact</a></li>
              <li><a href="#" className="hover:text-red-400">Careers</a></li>
              <li><a href="#" className="hover:text-red-400">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-red-400">Help Center</a></li>
              <li><a href="#" className="hover:text-red-400">Returns</a></li>
              <li><a href="#" className="hover:text-red-400">Shipping Info</a></li>
              <li><a href="#" className="hover:text-red-400">Track Order</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-red-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-red-400">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Georgy Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;