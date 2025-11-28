import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { useRealTime } from '../../contexts/RealTimeContext';
import { RealTimeStatusIndicator, ConnectionQualityIndicator } from '../../components/RealTimeStatusIndicator';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
  read: boolean;
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'artisan';
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatScreenProps {
  navigation: any;
  route: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { chatId, participantId, requestId } = route.params;
  const { socket, isConnected } = useRealTime();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<ChatParticipant | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [participantTyping, setParticipantTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentUserId = 'current-user-id'; // TODO: Get from auth context

  useEffect(() => {
    loadChatData();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, [chatId]);

  useEffect(() => {
    // Join chat room when socket connects
    if (isConnected && socket && chatId) {
      socket.emit('join_chat', { chatId, userId: currentUserId });
    }
  }, [isConnected, chatId]);

  const loadChatData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockParticipant: ChatParticipant = {
        id: participantId,
        name: 'John Doe',
        avatar: '',
        role: 'artisan',
        isOnline: true,
        lastSeen: '2024-01-15T14:30:00Z',
      };

      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: participantId,
          senderName: 'John Doe',
          text: 'Hi! I saw your request for plumbing work. I can help you with the kitchen faucet repair.',
          timestamp: '2024-01-15T10:00:00Z',
          type: 'text',
          read: true,
        },
        {
          id: '2',
          senderId: currentUserId,
          senderName: 'Me',
          text: 'Great! What would be your quote for the job?',
          timestamp: '2024-01-15T10:05:00Z',
          type: 'text',
          read: true,
        },
        {
          id: '3',
          senderId: participantId,
          senderName: 'John Doe',
          text: 'Based on your description, I would charge ₦12,000 for the repair including parts and labor. I can start tomorrow if that works for you.',
          timestamp: '2024-01-15T10:10:00Z',
          type: 'text',
          read: true,
        },
        {
          id: '4',
          senderId: currentUserId,
          senderName: 'Me',
          text: 'That sounds reasonable. Can you send me some photos of your previous work?',
          timestamp: '2024-01-15T10:15:00Z',
          type: 'text',
          read: true,
        },
      ];

      setParticipant(mockParticipant);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socket.on('typing_start', ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) {
        setParticipantTyping(true);
      }
    });

    socket.on('typing_stop', ({ userId }: { userId: string }) => {
      if (userId !== currentUserId) {
        setParticipantTyping(false);
      }
    });

    socket.on('user_online', ({ userId }: { userId: string }) => {
      if (userId === participantId) {
        setParticipant(prev => prev ? { ...prev, isOnline: true } : null);
      }
    });

    socket.on('user_offline', ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      if (userId === participantId) {
        setParticipant(prev => prev ? { ...prev, isOnline: false, lastSeen } : null);
      }
    });
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;
    
    socket.off('new_message');
    socket.off('typing_start');
    socket.off('typing_stop');
    socket.off('user_online');
    socket.off('user_offline');
  };

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'Me',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false,
    };

    // Add message locally first for immediate feedback
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Send via socket
    socket.emit('send_message', {
      chatId,
      message: newMessage,
    });

    // Stop typing indicator
    stopTyping();
    scrollToBottom();
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing_start', { chatId, userId: currentUserId });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing_stop', { chatId, userId: currentUserId });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getOnlineStatus = () => {
    if (!participant) return '';
    
    if (participant.isOnline) {
      return 'Online';
    } else if (participant.lastSeen) {
      const lastSeen = new Date(participant.lastSeen);
      const now = new Date();
      const diffMs = now.getTime() - lastSeen.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `Last seen ${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Last seen ${diffHours}h ago`;
      }
    }
    return 'Offline';
  };

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isCurrentUser = message.senderId === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {message.type === 'image' && message.imageUrl && (
            <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
          )}
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {message.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!participantTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{participant?.name} is typing...</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.participantInfo}>
            <View style={styles.avatarContainer}>
              {participant?.avatar ? (
                <Image source={{ uri: participant.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {participant?.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {participant?.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.participantDetails}>
              <Text style={styles.participantName}>{participant?.name}</Text>
              <View style={styles.statusRow}>
                <Text style={styles.onlineStatus}>{getOnlineStatus()}</Text>
                <ConnectionQualityIndicator style={{ marginLeft: 8 }} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <RealTimeStatusIndicator size="small" />
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {/* TODO: Open chat menu */}}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {renderTypingIndicator()}

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {/* TODO: Handle file attachment */}}
          >
            <Ionicons name="add" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : null
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? colors.white : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.white,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  onlineStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    marginLeft: 16,
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    gap: 6,
  },
  connectionText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  currentUserText: {
    color: colors.white,
  },
  otherUserText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: colors.white,
    opacity: 0.8,
  },
  otherUserTime: {
    color: colors.textSecondary,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});

export default ChatScreen;