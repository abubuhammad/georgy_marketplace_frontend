import { useState, useEffect, useCallback } from 'react';
import { isDevMode } from '@/lib/supabase';
import { ChatMessage, ServiceChat } from '@/types';
import { artisanService } from '@/services/artisanService';

interface UseRealTimeChatProps {
  chatId: string;
  userId: string;
}

export const useRealTimeChat = ({ chatId, userId }: UseRealTimeChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<ServiceChat | null>(null);

  const loadChat = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock implementation - would use Prisma for chat data
      console.log(`Loading chat: ${chatId} for user: ${userId}`);
      
      // Mock chat data
      const mockChat: ServiceChat = {
        id: chatId,
        service_request_id: 'request-123',
        customer_id: 'customer-123',
        artisan_id: 'artisan-123',
        status: 'active',
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      };
      
      // Mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          chat_id: chatId,
          sender_id: 'customer-123',
          content: 'Hello, I need help with plumbing',
          message_type: 'text',
          created_at: new Date().toISOString(),
          sender: {
            id: 'customer-123',
            first_name: 'John',
            last_name: 'Doe',
            avatar_url: null,
          },
        },
        {
          id: 'msg-2',
          chat_id: chatId,
          sender_id: 'artisan-123',
          content: 'Sure! I can help you with that.',
          message_type: 'text',
          created_at: new Date().toISOString(),
          sender: {
            id: 'artisan-123',
            first_name: 'Mike',
            last_name: 'Smith',
            avatar_url: null,
          },
        },
      ];
      
      setChat(mockChat);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, userId]);

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    try {
      // Mock implementation - would use Prisma to save message
      console.log(`Sending message in chat ${chatId}:`, content);
      
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        chat_id: chatId,
        sender_id: userId,
        content,
        message_type: messageType,
        created_at: new Date().toISOString(),
        sender: {
          id: userId,
          first_name: 'Current',
          last_name: 'User',
          avatar_url: null,
        },
      };

      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [chatId, userId]);

  const markAsRead = useCallback(async () => {
    try {
      // Mock implementation - would use Prisma to mark messages as read
      console.log(`Marking messages as read in chat: ${chatId}`);
      await artisanService.markMessagesAsRead(chatId, userId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatId, userId]);

  useEffect(() => {
    loadChat();
    
    // Mock real-time subscription - would use WebSocket or Prisma subscription
    console.log('Setting up real-time chat subscription for:', chatId);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up real-time chat subscription for:', chatId);
    };
  }, [loadChat, chatId]);

  return {
    messages,
    chat,
    loading,
    sendMessage,
    markAsRead,
    refetch: loadChat,
  };
};

export default useRealTimeChat;
