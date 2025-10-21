import React from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Smartphone, 
  Download, 
  Star, 
  Users, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle,
  Play,
  Wrench,
  Zap,
  Paintbrush,
  Car,
  Scissors,
  Home,
  ArrowRight,
  Apple,
  PlaySquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ArtisanConnectPage: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const services = [
    { icon: Wrench, name: 'Plumbing', color: 'bg-blue-500' },
    { icon: Zap, name: 'Electrical', color: 'bg-yellow-500' },
    { icon: Paintbrush, name: 'Painting', color: 'bg-purple-500' },
    { icon: Car, name: 'Auto Repair', color: 'bg-green-500' },
    { icon: Scissors, name: 'Beauty', color: 'bg-pink-500' },
    { icon: Home, name: 'Cleaning', color: 'bg-teal-500' },
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Discovery',
      description: 'Find skilled artisans near you using GPS technology'
    },
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All artisans are ID-verified with certification checks'
    },
    {
      icon: Star,
      title: 'Rating & Reviews',
      description: 'Two-way feedback system ensuring quality service'
    },
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Monitor job progress with live status updates'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Artisans' },
    { value: '50,000+', label: 'Happy Customers' },
    { value: '4.9★', label: 'Average Rating' },
    { value: '100%', label: 'Secure Payments' }
  ];

  const SectionWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const sectionRef = React.useRef(null);
    const sectionIsInView = useInView(sectionRef, { once: true, amount: 0.1 });

    return (
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 50 }}
        animate={sectionIsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-accent to-primary text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 70%, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <Badge className="bg-white/20 text-white border-white/30 mb-6">
                📱 Mobile App Available
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                <span className="block">ArtisanConnect</span>
                <span className="block text-yellow-300">Mobile App</span>
              </h1>
              
              <p className="text-xl text-gray-100 mb-8 leading-relaxed">
                Connect with skilled professionals on-the-go. Book services, track progress, 
                and manage payments - all from your mobile device.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-black hover:bg-gray-800 text-white px-6 py-4 rounded-xl flex items-center"
                    onClick={() => window.open('https://apps.apple.com/app/georgy-artisanconnect', '_blank')}
                  >
                    <Apple className="w-6 h-6 mr-3" />
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-lg font-semibold">App Store</div>
                    </div>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl flex items-center"
                    onClick={() => window.open('https://play.google.com/store/apps/details?id=com.georgy.artisanconnect', '_blank')}
                  >
                    <PlaySquare className="w-6 h-6 mr-3" />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-lg font-semibold">Google Play</div>
                    </div>
                  </Button>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">4.9★</div>
                  <div className="text-sm text-gray-200">App Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">100K+</div>
                  <div className="text-sm text-gray-200">Downloads</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                <div className="w-72 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Phone Screen Content */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white p-6">
                      {/* App Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">ArtisanConnect</h3>
                          <p className="text-sm text-gray-600">Find skilled professionals</p>
                        </div>
                        <div className="w-8 h-8 bg-primary rounded-full"></div>
                      </div>
                      
                      {/* Service Categories */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {services.slice(0, 4).map((service, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm border">
                            <div className={`w-8 h-8 ${service.color} rounded-lg flex items-center justify-center mb-2`}>
                              <service.icon className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-xs font-medium text-gray-800">{service.name}</p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Featured Artisan */}
                      <div className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">John Smith</p>
                            <p className="text-xs text-gray-600">Plumber • 4.9★ (127)</p>
                            <p className="text-xs text-gray-500">2.3 km away</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full"
                >
                  <CheckCircle className="w-5 h-5" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-yellow-500 text-white p-2 rounded-full"
                >
                  <Star className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Service Categories Section */}
      <SectionWrapper className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Available Services</h2>
            <p className="text-lg text-gray-600">Professional services at your fingertips</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center group cursor-pointer"
              >
                <div className={`w-16 h-16 ${service.color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Features Section */}
      <SectionWrapper className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ArtisanConnect?</h2>
            <p className="text-lg text-gray-600">Experience the future of service booking</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* How It Works Section */}
      <SectionWrapper className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get your service done in 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Post Your Request',
                description: 'Describe your service needs with photos and location details',
                color: 'bg-blue-500'
              },
              {
                step: '2',
                title: 'Get Quotes',
                description: 'Receive competitive quotes from verified artisans near you',
                color: 'bg-green-500'
              },
              {
                step: '3',
                title: 'Get It Done',
                description: 'Track progress and pay securely when the job is completed',
                color: 'bg-purple-500'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="text-center relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0">
                    <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className={`w-24 h-24 ${item.color} rounded-full mx-auto mb-6 flex items-center justify-center relative z-10`}>
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Stats Section */}
      <SectionWrapper className="py-16 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-xl opacity-90">Join Nigeria's fastest-growing service platform</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Smartphone className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-4xl font-bold mb-4">
              Download ArtisanConnect Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start connecting with skilled professionals in your area
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl flex items-center"
                  onClick={() => window.open('https://apps.apple.com/app/georgy-artisanconnect', '_blank')}
                >
                  <Apple className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl flex items-center"
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=com.georgy.artisanconnect', '_blank')}
                >
                  <PlaySquare className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default ArtisanConnectPage;