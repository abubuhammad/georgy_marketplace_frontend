import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Truck,
  CreditCard,
  Smartphone,
  Building,
  Briefcase,
  Car,
  Shirt,
  Home,
  Package,
  ArrowRight,
  Star,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ModernFooterProps {
  className?: string;
}

export const ModernFooter: React.FC<ModernFooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    marketplace: [
      { label: 'Electronics', href: '/category/electronics', icon: <Smartphone className="w-4 h-4" /> },
      { label: 'Fashion', href: '/category/fashion', icon: <Shirt className="w-4 h-4" /> },
      { label: 'Vehicles', href: '/category/vehicles', icon: <Car className="w-4 h-4" /> },
      { label: 'Real Estate', href: '/properties', icon: <Building className="w-4 h-4" /> },
      { label: 'Jobs', href: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Home & Garden', href: '/category/home-garden', icon: <Home className="w-4 h-4" /> }
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
      { label: 'Investor Relations', href: '/investors' },
      { label: 'Sustainability', href: '/sustainability' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety Center', href: '/safety' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Dispute Resolution', href: '/disputes' },
      { label: 'Report a Problem', href: '/report' },
      { label: 'Community Guidelines', href: '/guidelines' }
    ],
    selling: [
      { label: 'Sell on Georgy Marketplace', href: '/sell' },
      { label: 'Seller Dashboard', href: '/seller/dashboard' },
      { label: 'Seller Resources', href: '/seller/resources' },
      { label: 'Advertising', href: '/advertising' },
      { label: 'Fee Structure', href: '/fees' },
      { label: 'API Documentation', href: '/api-docs' }
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Data Protection', href: '/data-protection' },
      { label: 'Intellectual Property', href: '/ip' },
      { label: 'User Agreement', href: '/agreement' }
    ]
  };

  const socialLinks = [
    { 
      icon: <Facebook className="w-5 h-5" />, 
      href: 'https://facebook.com/georgymarketplace',
      label: 'Facebook',
      color: 'hover:bg-blue-600'
    },
    { 
      icon: <Twitter className="w-5 h-5" />, 
      href: 'https://twitter.com/georgymarket',
      label: 'Twitter',
      color: 'hover:bg-blue-400'
    },
    { 
      icon: <Instagram className="w-5 h-5" />, 
      href: 'https://instagram.com/georgymarketplace',
      label: 'Instagram',
      color: 'hover:bg-pink-600'
    },
    { 
      icon: <Linkedin className="w-5 h-5" />, 
      href: 'https://linkedin.com/company/georgy',
      label: 'LinkedIn',
      color: 'hover:bg-blue-700'
    },
    { 
      icon: <Youtube className="w-5 h-5" />, 
      href: 'https://youtube.com/georgymarketplace',
      label: 'YouTube',
      color: 'hover:bg-red-600'
    }
  ];

  const trustBadges = [
    { icon: <Shield className="w-8 h-8" />, label: 'Secure Platform', description: '256-bit SSL encryption' },
    { icon: <Award className="w-8 h-8" />, label: 'Verified Sellers', description: 'Background checked' },
    { icon: <Truck className="w-8 h-8" />, label: 'Fast Delivery', description: 'Same day available' },
    { icon: <CreditCard className="w-8 h-8" />, label: 'Safe Payments', description: 'Buyer protection' }
  ];

  const stats = [
    { value: '2.5M+', label: 'Active Users', icon: <Users className="w-5 h-5" /> },
    { value: '500K+', label: 'Products Listed', icon: <Package className="w-5 h-5" /> },
    { value: '50K+', label: 'Verified Sellers', icon: <Award className="w-5 h-5" /> },
    { value: '99.9%', label: 'Uptime', icon: <Clock className="w-5 h-5" /> }
  ];

  return (
    <footer className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-gray-700/50 bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Stay Updated with Georgy Marketplace
              </h2>
              <p className="text-gray-300 text-lg mb-4">
                Get exclusive deals, new product launches, and marketplace insights delivered to your inbox.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>Join 500K+ subscribers getting weekly updates</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-red-400"
                />
              </div>
              <Button className="h-12 px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-red-600/30 group-hover:to-orange-600/30 transition-all duration-300">
                  <div className="text-red-400 group-hover:text-red-300 transition-colors">
                    {badge.icon}
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-1">{badge.label}</h4>
                <p className="text-xs text-gray-400">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/" className="inline-block mb-6">
                <img 
                  src="/logo/georgy-logo-white.png" 
                  alt="Georgy Marketplace" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='40' viewBox='0 0 150 40'%3E%3Ctext x='10' y='25' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23ffffff'%3EGeorgy%3C/text%3E%3C/svg%3E";
                  }}
                />
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Nigeria's most trusted marketplace connecting millions of buyers and sellers. 
                Find everything you need in one place.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-3 text-red-400" />
                  <span>+234 (0) 700 GEORGY-MP</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-3 text-red-400" />
                  <span>hello@georgymarketplace.ng</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-3 text-red-400" />
                  <span>Lagos, Abuja & 36 States</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 bg-gray-700 hover:bg-gray-600 ${social.color} rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300`}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Marketplace Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Marketplace</h3>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link, index) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center text-gray-300 hover:text-red-400 transition-colors duration-300 group"
                  >
                    <span className="text-red-400/60 group-hover:text-red-400 mr-2">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Selling Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white">For Sellers</h3>
            <ul className="space-y-2">
              {footerLinks.selling.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <span className="text-red-400 mr-2">{stat.icon}</span>
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Georgy Marketplace. All rights reserved. Built with ❤️ in Nigeria.
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};