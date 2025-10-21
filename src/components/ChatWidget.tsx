import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  orderId?: string;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline: boolean;
  orderId?: string;
}

interface ChatWidgetProps {
  orderId?: string;
  participantId?: string;
  participantName?: string;
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  orderId, 
  participantId, 
  participantName, 
  className 
}) => {
  const { user } = useAuth();
  const { sendMessage, isConnected } = useWebSocket();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Set initial conversation if participantId is provided
  useEffect(() => {
    if (participantId && participantName && !activeConversation) {
      const existingConversation = conversations.find(c => c.participantId === participantId);
      if (existingConversation) {
        setActiveConversation(existingConversation.id);
      } else {
        // Create new conversation
        const newConversation: ChatConversation = {
          id: `${user?.id}-${participantId}`,
          participantId,
          participantName,
          participantRole: 'USER', // Default, will be updated from API
          unreadCount: 0,
          isOnline: false,
          orderId
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation.id);
      }
    }
  }, [participantId, participantName, conversations, activeConversation, user?.id, orderId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          isOwn: msg.senderId === user?.id
        })));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;

    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user?.id!,
      senderName: `${user?.firstName} ${user?.lastName}`,
      message: newMessage.trim(),
      timestamp: new Date(),
      orderId: conversation.orderId,
      isOwn: true,
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      // Send via WebSocket
      sendMessage(conversation.participantId, newMessage.trim(), conversation.orderId);
      
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
      
      // Update conversation last message
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConversation
            ? {
                ...c,
                lastMessage: newMessage.trim(),
                lastMessageTime: new Date()
              }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' } // Could add failed status
            : msg
        )
      );
    }
  };

  const getMessageTimeDisplay = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm');
    } else if (isYesterday(timestamp)) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM dd');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const activeConv = conversations.find(c => c.id === activeConversation);
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <>
      {/* Chat Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        className={cn("relative", className)}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Chat
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {totalUnread > 99 ? '99+' : totalUnread}
          </Badge>
        )}
      </Button>

      {/* Chat Window */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-96 p-0">
          {!activeConversation ? (
            // Conversations List
            <>
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center justify-between">
                  Messages
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span className="text-xs text-gray-500">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="flex-1">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start a conversation from an order
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setActiveConversation(conversation.id)}
                        className="p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {getInitials(conversation.participantName)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {conversation.participantName}
                              </p>
                              {conversation.lastMessageTime && (
                                <span className="text-xs text-gray-500">
                                  {getMessageTimeDisplay(conversation.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            // Active Conversation
            <>
              <SheetHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveConversation(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(activeConv?.participantName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-sm">
                        {activeConv?.participantName}
                      </SheetTitle>
                      <div className="flex items-center space-x-2">
                        <Circle
                          className={cn(
                            'w-2 h-2',
                            activeConv?.isOnline 
                              ? 'fill-green-500 text-green-500' 
                              : 'fill-gray-400 text-gray-400'
                          )}
                        />
                        <span className="text-xs text-gray-500">
                          {activeConv?.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="text-center text-gray-500 py-8">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-xs lg:max-w-md px-3 py-2 rounded-lg',
                            message.isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          )}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span
                              className={cn(
                                'text-xs',
                                message.isOwn ? 'text-blue-100' : 'text-gray-500'
                              )}
                            >
                              {getMessageTimeDisplay(message.timestamp)}
                            </span>
                            {message.isOwn && message.status && (
                              <div className="ml-2">
                                {message.status === 'sending' && (
                                  <Circle className="w-3 h-3 animate-pulse text-blue-200" />
                                )}
                                {message.status === 'sent' && (
                                  <Circle className="w-3 h-3 fill-blue-200 text-blue-200" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={!isConnected}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newMessage.trim() || !isConnected}
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-1">
                    Disconnected. Reconnecting...
                  </p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatWidget;