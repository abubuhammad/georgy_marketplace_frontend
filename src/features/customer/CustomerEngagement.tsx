import React, { useState, useEffect } from 'react';
import { 
  Trophy, Gift, Star, Award, TrendingUp, Zap, Crown, 
  Target, CheckCircle, Calendar, Flame, Medal, Users 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import customerService from '@/services/customerService';
import { CustomerEngagement as EngagementType, CustomerBadge, CustomerMilestone } from './types';

const CustomerEngagement: React.FC = () => {
  const { user } = useAuthContext();
  const [engagement, setEngagement] = useState<EngagementType | null>(null);
  const [availableBadges, setAvailableBadges] = useState<CustomerBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEngagementData();
  }, [user]);

  const loadEngagementData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const engagementData = await customerService.getCustomerEngagement(user.id);
      setEngagement(engagementData);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoyaltyLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'text-amber-600 bg-amber-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      case 'diamond': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLoyaltyLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return <Medal className="w-5 h-5" />;
      case 'silver': return <Award className="w-5 h-5" />;
      case 'gold': return <Trophy className="w-5 h-5" />;
      case 'platinum': return <Crown className="w-5 h-5" />;
      case 'diamond': return <Star className="w-5 h-5" />;
      default: return <Medal className="w-5 h-5" />;
    }
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const renderLoyaltyOverview = () => (
    <div className="space-y-6">
      {/* Loyalty Level Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full"></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full ${getLoyaltyLevelColor(engagement?.loyaltyLevel || 'bronze')}`}>
                {getLoyaltyLevelIcon(engagement?.loyaltyLevel || 'bronze')}
              </div>
              <div>
                <CardTitle className="capitalize">{engagement?.loyaltyLevel} Member</CardTitle>
                <CardDescription>
                  You've earned {engagement?.totalPoints.toLocaleString()} total points
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {engagement?.availablePoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Available Points</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold">₦{engagement?.lifetimeSpent.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Lifetime Spent</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold">{engagement?.referralCount}</div>
              <div className="text-sm text-gray-600">Referrals Made</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-semibold">{engagement?.streakDays}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Earn More Points</CardTitle>
          <CardDescription>Complete these actions to boost your loyalty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Write a Review</h4>
                <p className="text-sm text-gray-600">+50 points per review</p>
              </div>
              <Button size="sm">Review</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Refer a Friend</h4>
                <p className="text-sm text-gray-600">+200 points per referral</p>
              </div>
              <Button size="sm">Refer</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Complete Purchase</h4>
                <p className="text-sm text-gray-600">1 point per ₦100 spent</p>
              </div>
              <Button size="sm">Shop</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Daily Check-in</h4>
                <p className="text-sm text-gray-600">+10 points daily</p>
              </div>
              <Button size="sm">Check-in</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-6">
      {/* Earned Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Your Badges ({engagement?.badges.length || 0})
          </CardTitle>
          <CardDescription>
            Badges you've earned for your activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {engagement?.badges && engagement.badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {engagement.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 text-center ${getBadgeRarityColor(badge.rarity)}`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-full flex items-center justify-center">
                    <img 
                      src={badge.iconUrl || '/api/placeholder/48/48'} 
                      alt={badge.name}
                      className="w-8 h-8"
                    />
                  </div>
                  <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {badge.rarity}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No badges yet</h3>
              <p className="text-gray-600 mb-4">
                Complete activities to earn your first badge
              </p>
              <Button>Start Shopping</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Available Badges</CardTitle>
          <CardDescription>
            Badges you can earn by completing specific activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">First Review</h4>
                <p className="text-sm text-gray-600">Write your first product review</p>
                <Badge variant="outline" className="mt-1">Common</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Social Butterfly</h4>
                <p className="text-sm text-gray-600">Refer 5 friends to the platform</p>
                <Badge variant="outline" className="mt-1">Rare</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Big Spender</h4>
                <p className="text-sm text-gray-600">Spend over ₦100,000 in total</p>
                <Badge variant="outline" className="mt-1">Epic</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Streak Master</h4>
                <p className="text-sm text-gray-600">Login for 30 consecutive days</p>
                <Badge variant="outline" className="mt-1">Legendary</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMilestones = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Current Milestones
          </CardTitle>
          <CardDescription>
            Track your progress towards exclusive rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {engagement?.milestones && engagement.milestones.length > 0 ? (
              engagement.milestones.map((milestone) => (
                <div key={milestone.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{milestone.name}</h4>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {milestone.current} / {milestone.target}
                      </div>
                      {milestone.isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Progress 
                    value={(milestone.current / milestone.target) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{Math.round((milestone.current / milestone.target) * 100)}% complete</span>
                    <div className="flex items-center space-x-4">
                      {milestone.reward.points && (
                        <span className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {milestone.reward.points} points
                        </span>
                      )}
                      {milestone.reward.discount && (
                        <span className="flex items-center">
                          <Gift className="w-3 h-3 mr-1" />
                          {milestone.reward.discount}% discount
                        </span>
                      )}
                      {milestone.reward.freeShipping && (
                        <span>Free shipping</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active milestones</h3>
                <p className="text-gray-600">
                  Start shopping to unlock milestone challenges
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your engagement data...</p>
        </div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load engagement data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loyalty & Rewards</h1>
              <p className="text-gray-600">
                Earn points, unlock badges, and enjoy exclusive benefits
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full ${getLoyaltyLevelColor(engagement.loyaltyLevel)}`}>
                <div className="flex items-center space-x-2">
                  {getLoyaltyLevelIcon(engagement.loyaltyLevel)}
                  <span className="font-medium capitalize">{engagement.loyaltyLevel}</span>
                </div>
              </div>
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderLoyaltyOverview()}
          </TabsContent>

          <TabsContent value="badges">
            {renderBadges()}
          </TabsContent>

          <TabsContent value="milestones">
            {renderMilestones()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerEngagement;
