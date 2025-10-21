import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useArtisan } from '@/contexts/ArtisanContext';
// import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export default function ArtisanDashboard() {
  const {
    currentArtisan,
    artisanAnalytics,
    activeRequests,
    pendingQuotes,
    activeChats,
    unreadMessages,
    loadAnalytics,
    setOnlineStatus,
    isLoading
  } = useArtisan();

  const [isOnline, setIsOnlineState] = useState(currentArtisan?.isOnline || false);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnlineState(newStatus);
    // await setOnlineStatus(currentArtisan?.userId!, newStatus);
  };

  // Mock data for charts (replace with real data from analytics)
  const earningsData = [
    { name: 'Mon', earnings: 12000 },
    { name: 'Tue', earnings: 8000 },
    { name: 'Wed', earnings: 15000 },
    { name: 'Thu', earnings: 10000 },
    { name: 'Fri', earnings: 18000 },
    { name: 'Sat', earnings: 22000 },
    { name: 'Sun', earnings: 16000 },
  ];

  const jobsData = [
    { name: 'Jan', completed: 12, pending: 3 },
    { name: 'Feb', completed: 15, pending: 2 },
    { name: 'Mar', completed: 18, pending: 4 },
    { name: 'Apr', completed: 14, pending: 1 },
    { name: 'May', completed: 20, pending: 5 },
    { name: 'Jun', completed: 16, pending: 2 },
  ];

  const QuickStatsCard = ({ icon: Icon, title, value, change, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change && (
                <Badge variant={change.type === 'increase' ? 'default' : 'secondary'}>
                  {change.type === 'increase' ? '+' : ''}{change.value}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivityItem = ({ activity }: { activity: any }) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${activity.color}`}>
        <activity.icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
      {activity.badge && (
        <Badge variant={activity.badge.variant}>{activity.badge.text}</Badge>
      )}
    </div>
  );

  // Mock recent activities
  const recentActivities = [
    {
      icon: MessageSquare,
      title: 'New quote request from John Doe',
      time: '2 minutes ago',
      color: 'bg-blue-500',
      badge: { text: 'New', variant: 'default' as const }
    },
    {
      icon: CheckCircle,
      title: 'Job completed: Kitchen faucet repair',
      time: '1 hour ago',
      color: 'bg-green-500',
      badge: { text: '₦15,000', variant: 'secondary' as const }
    },
    {
      icon: Star,
      title: 'Received 5-star review from Sarah',
      time: '3 hours ago',
      color: 'bg-yellow-500'
    },
    {
      icon: AlertCircle,
      title: 'Urgent request: Electrical issue',
      time: '5 hours ago',
      color: 'bg-red-500',
      badge: { text: 'Emergency', variant: 'destructive' as const }
    }
  ];

  if (!currentArtisan) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👨‍🔧</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Complete Your Artisan Profile
        </h3>
        <p className="text-gray-600 mb-4">
          Set up your artisan profile to start receiving service requests
        </p>
        <Button>Complete Profile Setup</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {currentArtisan.user.firstName}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your business</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Online Status Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <Button
              variant={isOnline ? 'default' : 'outline'}
              size="sm"
              onClick={toggleOnlineStatus}
              className={isOnline ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-white' : 'bg-gray-400'}`} />
              {isOnline ? 'Available' : 'Away'}
            </Button>
          </div>
          
          {/* Profile Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentArtisan.user.avatar} />
            <AvatarFallback>
              {currentArtisan.user.firstName[0]}{currentArtisan.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCard
          icon={DollarSign}
          title="This Month's Earnings"
          value={`₦${artisanAnalytics?.thisMonthEarnings?.toLocaleString() || '0'}`}
          change={{ type: 'increase', value: '12' }}
          color="bg-green-500"
        />
        
        <QuickStatsCard
          icon={CheckCircle}
          title="Active Jobs"
          value={activeRequests.length}
          color="bg-blue-500"
        />
        
        <QuickStatsCard
          icon={MessageSquare}
          title="Pending Quotes"
          value={pendingQuotes.length}
          color="bg-orange-500"
        />
        
        <QuickStatsCard
          icon={Star}
          title="Rating"
          value={currentArtisan.rating.toFixed(1)}
          change={{ type: 'increase', value: '0.2' }}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="earnings">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="jobs">Jobs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="earnings" className="mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₦${value}`, 'Earnings']} />
                        <Line 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="#dc2626" 
                          strokeWidth={2}
                          dot={{ fill: '#dc2626' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="jobs" className="mt-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={jobsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                        <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Active Jobs</span>
                </span>
                <Button variant="outline" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-gray-600">No active jobs at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-gray-600">{request.customer.firstName} {request.customer.lastName}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(request.createdAt), 'MMM dd')}</span>
                          </span>
                          <Badge variant="outline">
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          ₦{request.budget.max.toLocaleString()}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages {unreadMessages > 0 && (
                  <Badge className="ml-auto">{unreadMessages}</Badge>
                )}
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Jobs
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Portfolio
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {recentActivities.map((activity, index) => (
                  <RecentActivityItem key={index} activity={activity} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Profile Strength</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="w-full" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Basic information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Portfolio images</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span>Certification documents</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
