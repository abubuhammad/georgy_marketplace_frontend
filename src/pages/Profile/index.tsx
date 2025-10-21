import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ShoppingCart, User, Edit, Heart, Package, Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useAppContext } from '@/contexts/AppContext';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  discount?: number;
  inStock: boolean;
  category: string;
}

const mockUserListings: Product[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    price: 850000,
    originalPrice: 950000,
    image: '/placeholder.svg',
    rating: 4.5,
    reviewCount: 12,
    discount: 11,
    inStock: true,
    category: 'Electronics'
  }
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { itemCount } = useCart();
  const { currentPlatform } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'favorites' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    location: user?.city || '',
    bio: ''
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating profile:', profileData);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
                  <span className="text-xl font-bold text-gray-900">Georgy Marketplace</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate('/post-ad')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Post Ad
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-gray-600 mb-8">Please login to view your profile</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">Georgy Marketplace</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/post-ad')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Post Ad
                  </Button>
                  <Button variant="outline" size="sm" className="relative" onClick={() => navigate('/cart')}>
                    <ShoppingCart className="w-4 h-4" />
                    {itemCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                  <UserDropdown user={user} />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate('/post-ad')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Post Ad
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-red-600" size={32} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="text-yellow-400 mr-1" size={16} />
                    <span className="text-sm text-gray-600">4.8 (24 reviews)</span>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      activeTab === 'profile' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="mr-3" size={20} />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      activeTab === 'listings' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Package className="mr-3" size={20} />
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      activeTab === 'favorites' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className="mr-3" size={20} />
                    Favorites
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      activeTab === 'settings' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Settings className="mr-3" size={20} />
                    Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>

                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <p className="text-gray-900">{profileData.firstName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <p className="text-gray-900">{profileData.lastName || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{profileData.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'listings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                  <Button onClick={() => navigate('/post-ad')}>Post New Ad</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockUserListings.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <img
                          src={product.image || '/api/placeholder/300/200'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-red-600 font-bold text-xl">₦{product.price.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <Star className="text-yellow-400 mr-1" size={16} />
                          <span className="text-sm text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <Card>
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorite Items</h1>
                  <div className="text-center py-12">
                    <Heart className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600">Items you like will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card>
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span>Email notifications for new messages</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span>SMS notifications for urgent updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          <span>Marketing emails</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;