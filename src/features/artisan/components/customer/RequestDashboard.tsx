import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, MessageSquare, Star, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useArtisan } from '@/contexts/ArtisanContext';
import { ServiceRequest, RequestStatus } from '@/types';
// import { format } from 'date-fns';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending Quotes' },
  quoted: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Quotes Received' },
  assigned: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Artisan Assigned' },
  in_progress: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Work in Progress' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
  disputed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Disputed' },
};

export default function RequestDashboard() {
  const { 
    serviceRequests, 
    activeRequests, 
    completedRequests, 
    updateServiceRequestStatus,
    acceptQuote,
    rejectQuote,
    isLoading 
  } = useArtisan();

  const [selectedTab, setSelectedTab] = useState('active');

  const getProgressPercentage = (status: RequestStatus): number => {
    const statusProgress = {
      pending: 20,
      quoted: 40,
      assigned: 60,
      in_progress: 80,
      completed: 100,
      cancelled: 0,
      disputed: 0,
    };
    return statusProgress[status] || 0;
  };

  const RequestCard = ({ request }: { request: ServiceRequest }) => {
    const StatusIcon = statusConfig[request.status]?.icon || Clock;
    const progress = getProgressPercentage(request.status);

    return (
      <Card className="mb-4 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{request.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{request.description}</p>
            </div>
            <div className="ml-4">
              <Badge className={`${statusConfig[request.status]?.bg} ${statusConfig[request.status]?.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[request.status]?.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{request.location.city}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <Badge variant="outline" className="text-xs">
                {request.urgency}
              </Badge>
            </div>
            <div className="text-right font-medium text-green-600">
              ₦{request.budget.min.toLocaleString()} - ₦{request.budget.max.toLocaleString()}
            </div>
          </div>

          {/* Assigned Artisan */}
          {request.assignedArtisan && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.assignedArtisan.user.avatar} />
                <AvatarFallback>
                  {request.assignedArtisan.businessName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{request.assignedArtisan.businessName}</p>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{request.assignedArtisan.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{request.assignedArtisan.completedJobs} jobs</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>
          )}

          {/* Quotes */}
          {request.quotes && request.quotes.length > 0 && request.status === 'quoted' && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Quotes Received ({request.quotes.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {request.quotes.slice(0, 3).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={quote.artisan.user.avatar} />
                        <AvatarFallback>
                          {quote.artisan.businessName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{quote.artisan.businessName}</p>
                        <p className="text-xs text-gray-600">₦{quote.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectQuote(quote.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptQuote(quote.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
                {request.quotes.length > 3 && (
                  <Button variant="link" className="w-full text-sm">
                    View all {request.quotes.length} quotes
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {request.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateServiceRequestStatus(request.id, 'cancelled')}
              >
                Cancel Request
              </Button>
            )}
            
            {request.status === 'in_progress' && (
              <Button
                size="sm"
                onClick={() => updateServiceRequestStatus(request.id, 'completed')}
              >
                Mark as Complete
              </Button>
            )}
            
            {request.status === 'completed' && (
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-1" />
                Leave Review
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: 'active' | 'completed' }) => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">
        {type === 'active' ? '📝' : '✅'}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {type} requests
      </h3>
      <p className="text-gray-600 mb-4">
        {type === 'active' 
          ? "You don't have any active service requests. Create one to get started!"
          : "You haven't completed any service requests yet."
        }
      </p>
      {type === 'active' && (
        <Button>
          Create New Request
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
          <p className="text-gray-600">Track and manage your service requests</p>
        </div>
        <Button>
          Create New Request
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRequests.length}</p>
                <p className="text-sm text-gray-600">Active Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedRequests.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {serviceRequests.reduce((sum, req) => sum + (req.quotes?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Total Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeRequests.length === 0 ? (
            <EmptyState type="active" />
          ) : (
            <div>
              {activeRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedRequests.length === 0 ? (
            <EmptyState type="completed" />
          ) : (
            <div>
              {completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
