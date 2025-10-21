import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  Artisan,
  ServiceRequest,
  ServiceQuote,
  ServiceChat,
  ArtisanAnalytics,
  CustomerAnalytics,
  ServiceCategory,
  NotificationPreferences,
} from '@/types';
import { artisanService } from '@/services/artisanService';
import { useAuthContext } from './AuthContext';

interface ArtisanState {
  // Current user artisan profile
  currentArtisan: Artisan | null;
  
  // Service requests
  serviceRequests: ServiceRequest[];
  activeRequests: ServiceRequest[];
  completedRequests: ServiceRequest[];
  
  // Quotes
  pendingQuotes: ServiceQuote[];
  sentQuotes: ServiceQuote[];
  
  // Chats
  activeChats: ServiceChat[];
  unreadMessages: number;
  
  // Analytics
  artisanAnalytics: ArtisanAnalytics | null;
  customerAnalytics: CustomerAnalytics | null;
  
  // Categories
  serviceCategories: ServiceCategory[];
  
  // Artisan discovery
  nearbyArtisans: Artisan[];
  searchResults: Artisan[];
  
  // Notifications
  notifications: Notification[];
  notificationPreferences: NotificationPreferences | null;
  
  // UI states
  isLoading: boolean;
  error: string | null;
  
  // Real-time connection
  isConnected: boolean;
}

type ArtisanAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_ARTISAN'; payload: Artisan | null }
  | { type: 'SET_SERVICE_REQUESTS'; payload: ServiceRequest[] }
  | { type: 'ADD_SERVICE_REQUEST'; payload: ServiceRequest }
  | { type: 'UPDATE_SERVICE_REQUEST'; payload: ServiceRequest }
  | { type: 'SET_QUOTES'; payload: ServiceQuote[] }
  | { type: 'ADD_QUOTE'; payload: ServiceQuote }
  | { type: 'UPDATE_QUOTE'; payload: ServiceQuote }
  | { type: 'SET_CHATS'; payload: ServiceChat[] }
  | { type: 'UPDATE_CHAT'; payload: ServiceChat }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: any } }
  | { type: 'SET_ANALYTICS'; payload: { artisan?: ArtisanAnalytics; customer?: CustomerAnalytics } }
  | { type: 'SET_CATEGORIES'; payload: ServiceCategory[] }
  | { type: 'SET_NEARBY_ARTISANS'; payload: Artisan[] }
  | { type: 'SET_SEARCH_RESULTS'; payload: Artisan[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_NOTIFICATION_PREFERENCES'; payload: NotificationPreferences }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'INCREMENT_UNREAD_MESSAGES' }
  | { type: 'RESET_UNREAD_MESSAGES' };

const initialState: ArtisanState = {
  currentArtisan: null,
  serviceRequests: [],
  activeRequests: [],
  completedRequests: [],
  pendingQuotes: [],
  sentQuotes: [],
  activeChats: [],
  unreadMessages: 0,
  artisanAnalytics: null,
  customerAnalytics: null,
  serviceCategories: [],
  nearbyArtisans: [],
  searchResults: [],
  notifications: [],
  notificationPreferences: null,
  isLoading: false,
  error: null,
  isConnected: false,
};

function artisanReducer(state: ArtisanState, action: ArtisanAction): ArtisanState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_ARTISAN':
      return { ...state, currentArtisan: action.payload };
    
    case 'SET_SERVICE_REQUESTS':
      return {
        ...state,
        serviceRequests: action.payload,
        activeRequests: action.payload.filter(req => 
          ['pending', 'quoted', 'assigned', 'in_progress'].includes(req.status)
        ),
        completedRequests: action.payload.filter(req => 
          ['completed', 'cancelled'].includes(req.status)
        ),
      };
    
    case 'ADD_SERVICE_REQUEST':
      const newRequests = [...state.serviceRequests, action.payload];
      return {
        ...state,
        serviceRequests: newRequests,
        activeRequests: newRequests.filter(req => 
          ['pending', 'quoted', 'assigned', 'in_progress'].includes(req.status)
        ),
      };
    
    case 'UPDATE_SERVICE_REQUEST':
      const updatedRequests = state.serviceRequests.map(req =>
        req.id === action.payload.id ? action.payload : req
      );
      return {
        ...state,
        serviceRequests: updatedRequests,
        activeRequests: updatedRequests.filter(req => 
          ['pending', 'quoted', 'assigned', 'in_progress'].includes(req.status)
        ),
        completedRequests: updatedRequests.filter(req => 
          ['completed', 'cancelled'].includes(req.status)
        ),
      };
    
    case 'SET_QUOTES':
      return {
        ...state,
        pendingQuotes: action.payload.filter(quote => quote.status === 'pending'),
        sentQuotes: action.payload,
      };
    
    case 'ADD_QUOTE':
      return {
        ...state,
        sentQuotes: [...state.sentQuotes, action.payload],
        pendingQuotes: action.payload.status === 'pending' 
          ? [...state.pendingQuotes, action.payload]
          : state.pendingQuotes,
      };
    
    case 'UPDATE_QUOTE':
      const updatedSentQuotes = state.sentQuotes.map(quote =>
        quote.id === action.payload.id ? action.payload : quote
      );
      return {
        ...state,
        sentQuotes: updatedSentQuotes,
        pendingQuotes: updatedSentQuotes.filter(quote => quote.status === 'pending'),
      };
    
    case 'SET_CHATS':
      return { ...state, activeChats: action.payload };
    
    case 'UPDATE_CHAT':
      const updatedChats = state.activeChats.map(chat =>
        chat.id === action.payload.id ? action.payload : chat
      );
      return { ...state, activeChats: updatedChats };
    
    case 'ADD_MESSAGE':
      const chatsWithNewMessage = state.activeChats.map(chat =>
        chat.id === action.payload.chatId
          ? { ...chat, messages: [...chat.messages, action.payload.message] }
          : chat
      );
      return { ...state, activeChats: chatsWithNewMessage };
    
    case 'SET_ANALYTICS':
      return {
        ...state,
        artisanAnalytics: action.payload.artisan || state.artisanAnalytics,
        customerAnalytics: action.payload.customer || state.customerAnalytics,
      };
    
    case 'SET_CATEGORIES':
      return { ...state, serviceCategories: action.payload };
    
    case 'SET_NEARBY_ARTISANS':
      return { ...state, nearbyArtisans: action.payload };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications] 
      };
    
    case 'SET_NOTIFICATION_PREFERENCES':
      return { ...state, notificationPreferences: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    case 'INCREMENT_UNREAD_MESSAGES':
      return { ...state, unreadMessages: state.unreadMessages + 1 };
    
    case 'RESET_UNREAD_MESSAGES':
      return { ...state, unreadMessages: 0 };
    
    default:
      return state;
  }
}

interface ArtisanContextType extends ArtisanState {
  // Artisan actions
  registerAsArtisan: (data: any) => Promise<void>;
  updateArtisanProfile: (data: Partial<Artisan>) => Promise<void>;
  setAvailability: (availability: any) => Promise<void>;
  
  // Service request actions
  createServiceRequest: (data: any) => Promise<void>;
  updateServiceRequestStatus: (requestId: string, status: string) => Promise<void>;
  
  // Quote actions
  submitQuote: (requestId: string, quoteData: any) => Promise<void>;
  acceptQuote: (quoteId: string) => Promise<void>;
  rejectQuote: (quoteId: string) => Promise<void>;
  
  // Search and discovery
  searchArtisans: (filters: any) => Promise<void>;
  findNearbyArtisans: (location: any, radius: number) => Promise<void>;
  
  // Chat actions
  sendMessage: (chatId: string, message: string, type?: string) => Promise<void>;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  
  // Analytics
  loadAnalytics: () => Promise<void>;
  
  // Categories
  loadServiceCategories: () => Promise<void>;
  
  // Real-time actions
  connectRealTime: () => void;
  disconnectRealTime: () => void;
}

const ArtisanContext = createContext<ArtisanContextType | undefined>(undefined);

export function ArtisanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(artisanReducer, initialState);
  const { user } = useAuth();

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      loadServiceCategories();
      if (user.role === 'artisan') {
        loadArtisanData();
      } else if (user.role === 'customer') {
        loadCustomerData();
      }
    }
  }, [user]);

  const loadArtisanData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load artisan profile
      const artisan = await artisanService.getArtisanProfile(user!.id);
      dispatch({ type: 'SET_CURRENT_ARTISAN', payload: artisan });
      
      // Load service requests for artisan
      const requests = await artisanService.getArtisanRequests(user!.id);
      dispatch({ type: 'SET_SERVICE_REQUESTS', payload: requests });
      
      // Load quotes
      const quotes = await artisanService.getArtisanQuotes(user!.id);
      dispatch({ type: 'SET_QUOTES', payload: quotes });
      
      // Load analytics
      const analytics = await artisanService.getArtisanAnalytics(user!.id);
      dispatch({ type: 'SET_ANALYTICS', payload: { artisan: analytics } });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load artisan data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadCustomerData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load customer's service requests
      const requests = await artisanService.getCustomerRequests(user!.id);
      dispatch({ type: 'SET_SERVICE_REQUESTS', payload: requests });
      
      // Load customer analytics
      const analytics = await artisanService.getCustomerAnalytics(user!.id);
      dispatch({ type: 'SET_ANALYTICS', payload: { customer: analytics } });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load customer data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const registerAsArtisan = async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const artisan = await artisanService.registerArtisan(data);
      dispatch({ type: 'SET_CURRENT_ARTISAN', payload: artisan });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to register as artisan' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateArtisanProfile = async (data: Partial<Artisan>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedArtisan = await artisanService.updateArtisanProfile(user!.id, data);
      dispatch({ type: 'SET_CURRENT_ARTISAN', payload: updatedArtisan });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setAvailability = async (availability: any) => {
    try {
      await artisanService.setAvailability(user!.id, availability);
      if (state.currentArtisan) {
        dispatch({
          type: 'SET_CURRENT_ARTISAN',
          payload: { ...state.currentArtisan, availability }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update availability' });
      throw error;
    }
  };

  const createServiceRequest = async (data: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const request = await artisanService.createServiceRequest({ ...data, customerId: user!.id });
      dispatch({ type: 'ADD_SERVICE_REQUEST', payload: request });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create service request' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateServiceRequestStatus = async (requestId: string, status: string) => {
    try {
      const updatedRequest = await artisanService.updateServiceRequestStatus(requestId, status);
      dispatch({ type: 'UPDATE_SERVICE_REQUEST', payload: updatedRequest });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update request status' });
      throw error;
    }
  };

  const submitQuote = async (requestId: string, quoteData: any) => {
    try {
      const quote = await artisanService.submitQuote(requestId, {
        ...quoteData,
        artisanId: user!.id
      });
      dispatch({ type: 'ADD_QUOTE', payload: quote });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit quote' });
      throw error;
    }
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      const updatedQuote = await artisanService.acceptQuote(quoteId);
      dispatch({ type: 'UPDATE_QUOTE', payload: updatedQuote });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to accept quote' });
      throw error;
    }
  };

  const rejectQuote = async (quoteId: string) => {
    try {
      const updatedQuote = await artisanService.rejectQuote(quoteId);
      dispatch({ type: 'UPDATE_QUOTE', payload: updatedQuote });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reject quote' });
      throw error;
    }
  };

  const searchArtisans = async (filters: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const results = await artisanService.searchArtisans(filters);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search artisans' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const findNearbyArtisans = async (location: any, radius: number) => {
    try {
      const artisans = await artisanService.findNearbyArtisans(location, radius);
      dispatch({ type: 'SET_NEARBY_ARTISANS', payload: artisans });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to find nearby artisans' });
    }
  };

  const sendMessage = async (chatId: string, message: string, type = 'text') => {
    try {
      const newMessage = await artisanService.sendMessage(chatId, {
        message,
        type,
        senderId: user!.id
      });
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message: newMessage } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      throw error;
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    try {
      await artisanService.markMessagesAsRead(chatId, user!.id);
      dispatch({ type: 'RESET_UNREAD_MESSAGES' });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      if (user?.role === 'artisan') {
        const analytics = await artisanService.getArtisanAnalytics(user.id);
        dispatch({ type: 'SET_ANALYTICS', payload: { artisan: analytics } });
      } else if (user?.role === 'customer') {
        const analytics = await artisanService.getCustomerAnalytics(user.id);
        dispatch({ type: 'SET_ANALYTICS', payload: { customer: analytics } });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load analytics' });
    }
  };

  const loadServiceCategories = async () => {
    try {
      const categories = await artisanService.getServiceCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load service categories' });
    }
  };

  const connectRealTime = () => {
    // Implement WebSocket connection for real-time updates
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
  };

  const disconnectRealTime = () => {
    // Implement WebSocket disconnection
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
  };

  const value: ArtisanContextType = {
    ...state,
    registerAsArtisan,
    updateArtisanProfile,
    setAvailability,
    createServiceRequest,
    updateServiceRequestStatus,
    submitQuote,
    acceptQuote,
    rejectQuote,
    searchArtisans,
    findNearbyArtisans,
    sendMessage,
    markMessagesAsRead,
    loadAnalytics,
    loadServiceCategories,
    connectRealTime,
    disconnectRealTime,
  };

  return (
    <ArtisanContext.Provider value={value}>
      {children}
    </ArtisanContext.Provider>
  );
}

export function useArtisan() {
  const context = useContext(ArtisanContext);
  if (context === undefined) {
    throw new Error('useArtisan must be used within an ArtisanProvider');
  }
  return context;
}
