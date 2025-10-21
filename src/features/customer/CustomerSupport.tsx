import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Plus, Send, Paperclip, Search, Filter,
  Clock, CheckCircle, AlertCircle, XCircle, User, Bot
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import customerService from '@/services/customerService';
import { CustomerSupport as SupportType, SupportMessage } from './types';

const CustomerSupport: React.FC = () => {
  const { user } = useAuthContext();
  const [tickets, setTickets] = useState<SupportType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: 'medium' as const,
    message: ''
  });

  useEffect(() => {
    loadSupportTickets();
  }, [user]);

  const loadSupportTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const ticketsData = await customerService.getSupportTickets(user.id);
      setTickets(ticketsData);
      
      // Auto-select first ticket if none selected
      if (ticketsData.length > 0 && !selectedTicket) {
        setSelectedTicket(ticketsData[0]);
      }
    } catch (error) {
      console.error('Error loading support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!user || !newTicket.subject.trim() || !newTicket.message.trim()) return;
    
    try {
      const ticketId = await customerService.createSupportTicket({
        customerId: user.id,
        subject: newTicket.subject,
        category: newTicket.category as any,
        priority: newTicket.priority,
        status: 'open'
      });

      // Add initial message
      await customerService.addSupportMessage({
        ticketId,
        senderId: user.id,
        senderType: 'customer',
        message: newTicket.message
      });

      // Reset form and close dialog
      setNewTicket({
        subject: '',
        category: '',
        priority: 'medium',
        message: ''
      });
      setShowNewTicketDialog(false);
      
      // Reload tickets
      await loadSupportTickets();
    } catch (error) {
      console.error('Error creating support ticket:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim() || !user) return;
    
    setSendingMessage(true);
    try {
      await customerService.addSupportMessage({
        ticketId: selectedTicket.id,
        senderId: user.id,
        senderType: 'customer',
        message: newMessage
      });
      
      setNewMessage('');
      // Reload tickets to get updated messages
      await loadSupportTickets();
      
      // Update selected ticket
      const updatedTickets = await customerService.getSupportTickets(user.id);
      const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'waiting_customer':
        return <MessageCircle className="w-4 h-4 text-orange-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_customer':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading support tickets...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
              <p className="text-gray-600">Get help with your orders, account, and more</p>
            </div>
            
            <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Describe your issue and we'll help you resolve it quickly
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={newTicket.category} 
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order Issue</SelectItem>
                          <SelectItem value="payment">Payment Problem</SelectItem>
                          <SelectItem value="shipping">Shipping & Delivery</SelectItem>
                          <SelectItem value="product">Product Question</SelectItem>
                          <SelectItem value="account">Account Issue</SelectItem>
                          <SelectItem value="technical">Technical Problem</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={newTicket.message}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createTicket}
                    disabled={!newTicket.subject.trim() || !newTicket.message.trim()}
                  >
                    Create Ticket
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tickets</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_customer">Waiting for Response</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTickets.length > 0 ? (
                  <div className="space-y-1">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                          selectedTicket?.id === ticket.id 
                            ? 'border-l-primary bg-primary/5' 
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {ticket.subject}
                          </h4>
                          <div className="flex items-center space-x-1 ml-2">
                            {getStatusIcon(ticket.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStatusColor(ticket.status)} variant="outline">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                            {ticket.priority}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.category}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No tickets found</h3>
                    <p className="text-sm text-gray-600">
                      {searchQuery || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Create your first support ticket'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ticket Details & Messages */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="line-clamp-2">{selectedTicket.subject}</CardTitle>
                      <CardDescription>
                        Ticket #{selectedTicket.id.slice(0, 8)} • Created {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedTicket.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          message.senderType === 'customer' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gray-100'
                        } rounded-lg p-3`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {message.senderType === 'customer' ? (
                                  <User className="w-3 h-3" />
                                ) : (
                                  <Bot className="w-3 h-3" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs opacity-70">
                              {message.senderType === 'customer' ? 'You' : 'Support Agent'}
                            </span>
                            <span className="text-xs opacity-50">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                {selectedTicket.status !== 'closed' && (
                  <div className="flex-shrink-0 border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="flex-shrink-0"
                      >
                        {sendingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Ticket</h3>
                  <p className="text-gray-600 mb-4">
                    Choose a support ticket to view the conversation
                  </p>
                  {tickets.length === 0 && (
                    <Button onClick={() => setShowNewTicketDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Ticket
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
