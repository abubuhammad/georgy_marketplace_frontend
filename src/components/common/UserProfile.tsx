import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  Heart, 
  ShoppingCart, 
  Plus,
  Edit,
  Save,
  Camera,
  Settings,
  Shield,
  FileText,
  Search,
  Bookmark
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { User as UserType } from '@/types';

interface UserProfileProps {
  showHeader?: boolean;
  showTabs?: boolean;
  defaultTab?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  showHeader = true, 
  showTabs = true,
  defaultTab = 'profile'
}) => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthContext();
  const { itemCount } = useCart();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    city: user?.city || '',
    state: user?.state || '',
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || ''
  });

  // Mock data for user activity
  const mockSavedSearches = [
    { id: '1', query: 'iPhone 14 Pro Lagos', filters: 'Electronics, New, ₦400k-₦500k', date: '2024-01-15', alerts: true },
    { id: '2', query: 'Toyota Corolla Abuja', filters: 'Vehicles, Used, ₦2M-₦4M', date: '2024-01-10', alerts: false },
    { id: '3', query: '3 bedroom Lekki', filters: 'Real Estate, Rent, ₦500k-₦1M', date: '2024-01-08', alerts: true }
  ];

  const mockFavorites = [
    { id: '1', title: 'Samsung Galaxy S24 Ultra', price: 450000, image: '/api/placeholder/100/100', location: 'Lagos' },
    { id: '2', title: 'MacBook Pro M3', price: 850000, image: '/api/placeholder/100/100', location: 'Abuja' },
    { id: '3', title: 'Honda Accord 2020', price: 3500000, image: '/api/placeholder/100/100', location: 'Port Harcourt' }
  ];

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showHeader && (
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                  <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
                  <span className="text-xl font-bold text-gray-900">Georgy Marketplace</span>
                </div>
                <Button onClick={() => navigate('/login')}>Login</Button>
              </div>
            </div>
          </div>
        )}
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
      {showHeader && (
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-red-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">Georgy Marketplace</span>
              </div>
              
              <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <User className="text-red-600" size={32} />
                      )}
                    </div>
                    <Button size="sm" className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {user.role.replace('_', ' ')}
                  </Badge>
                  {user.is_verified && (
                    <div className="flex items-center justify-center mt-2">
                      <Shield className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Verified</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  {user.city && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.city}, {user.state}
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showTabs ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  <TabsTrigger value="searches">Saved Searches</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Personal Information</CardTitle>
                        <Button
                          variant="outline"
                          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        >
                          {isEditing ? <Save className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                          {isEditing ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={formData.first_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={formData.last_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={formData.bio}
                              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700">First Name</Label>
                              <p className="text-gray-900">{user.first_name || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                              <p className="text-gray-900">{user.last_name || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Phone</Label>
                              <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Location</Label>
                              <p className="text-gray-900">{user.city ? `${user.city}, ${user.state}` : 'Not provided'}</p>
                            </div>
                          </div>
                          {user.bio && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Bio</Label>
                              <p className="text-gray-900">{user.bio}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Favorite Items ({mockFavorites.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockFavorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mockFavorites.map((item) => (
                            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-32 object-cover rounded-md mb-3"
                                />
                                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                                <p className="text-red-600 font-bold">₦{item.price.toLocaleString()}</p>
                                <p className="text-gray-500 text-xs mt-1">{item.location}</p>
                                <Button variant="outline" size="sm" className="w-full mt-2">
                                  <Heart className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                          <p className="text-gray-600">Start browsing and save items you like</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="searches" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bookmark className="w-5 h-5 mr-2" />
                        Saved Searches ({mockSavedSearches.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockSavedSearches.length > 0 ? (
                        <div className="space-y-4">
                          {mockSavedSearches.map((search) => (
                            <Card key={search.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{search.query}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{search.filters}</p>
                                    <p className="text-gray-500 text-xs mt-2">
                                      Saved on {new Date(search.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {search.alerts && (
                                      <Badge variant="default" className="bg-green-100 text-green-800">
                                        Alerts On
                                      </Badge>
                                    )}
                                    <Button variant="outline" size="sm">
                                      <Search className="w-4 h-4 mr-1" />
                                      Search Again
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
                          <p className="text-gray-600">Save your searches to quickly find them later</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Account Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                            <span>Marketing emails and promotions</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Price drop alerts for saved searches</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Show my profile to other users</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Allow others to see my favorites</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              // Show only profile content when tabs are disabled
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Location</Label>
                        <p className="text-gray-900">{user.city ? `${user.city}, ${user.state}` : 'Not provided'}</p>
                      </div>
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

export default UserProfile;
