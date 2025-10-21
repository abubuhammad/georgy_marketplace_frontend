import { generateMockData, mockStorage } from '@/lib/mockData';
import {
  Artisan,
  ServiceRequest,
  ServiceQuote,
  ServiceChat,
  ChatMessage,
  ServiceCategory,
  ArtisanAnalytics,
  CustomerAnalytics,
  ServiceReview,
  ArtisanFilters,
  ServiceRequestFilters,
} from '@/types';

class ArtisanService {
  // Artisan Management
  async registerArtisan(data: any): Promise<Artisan> {
    try {
      // Create new artisan with provided data
      const newArtisan = {
        ...generateMockData.artisan(),
        userId: data.userId,
        businessName: data.businessName,
        description: data.description,
        categories: data.categories,
        skills: data.skills,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        location: data.location,
        serviceArea: data.serviceArea,
        workingHours: data.workingHours,
      };

      // Store in mock storage
      mockStorage.artisans.push(newArtisan);
      
      console.log('Artisan registered:', newArtisan.businessName);
      return newArtisan;
    } catch (error) {
      console.error('Error registering artisan:', error);
      throw new Error('Failed to register artisan');
    }
  }

  async getArtisanProfile(userId: string): Promise<Artisan> {
    try {
      const artisan = mockStorage.artisans.find(a => a.userId === userId);
      if (!artisan) {
        throw new Error('Artisan not found');
      }
      console.log('Retrieved artisan profile:', artisan.businessName);
      return artisan;
    } catch (error) {
      console.error('Error getting artisan profile:', error);
      throw new Error('Failed to get artisan profile');
    }
  }

  async updateArtisanProfile(userId: string, data: Partial<Artisan>): Promise<Artisan> {
    const { data: artisan, error } = await supabase
      .from('artisans')
      .update({
        business_name: data.businessName,
        description: data.description,
        categories: data.categories,
        skills: data.skills,
        experience: data.experience,
        hourly_rate: data.hourlyRate,
        location: data.location,
        service_area: data.serviceArea,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*),
        certifications:certifications(*)
      `)
      .single();

    if (error) throw error;
    return this.transformArtisan(artisan);
  }

  async setAvailability(userId: string, availability: any): Promise<void> {
    const { error } = await supabase
      .from('artisans')
      .update({
        availability: availability,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const { error } = await supabase
      .from('artisans')
      .update({
        is_online: isOnline,
        last_active: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Service Categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return categories.map(this.transformServiceCategory);
  }

  // Artisan Discovery
  async searchArtisans(filters: ArtisanFilters): Promise<Artisan[]> {
    let query = supabase
      .from('artisans')
      .select(`
        *,
        user:users(*),
        portfolio:portfolio_items(*),
        certifications:certifications(*)
      `)
      .eq('is_active', true);

    if (filters.categories && filters.categories.length > 0) {
      query = query.overlaps('categories', filters.categories);
    }

    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }

    if (filters.hourlyRateMin) {
      query = query.gte('hourly_rate', filters.hourlyRateMin);
    }

    if (filters.hourlyRateMax) {
      query = query.lte('hourly_rate', filters.hourlyRateMax);
    }

    if (filters.isVerified) {
      query = query.eq('is_verified', true);
    }

    if (filters.experience) {
      query = query.gte('experience', filters.experience);
    }

    const { data: artisans, error } = await query;

    if (error) throw error;
    return artisans.map(this.transformArtisan);
  }

  async findNearbyArtisans(location: { latitude: number; longitude: number }, radius: number): Promise<Artisan[]> {
    // Mock implementation - would use Prisma with location queries
    console.log(`Finding artisans near ${location.latitude}, ${location.longitude} within ${radius}km`);
    
    // Return mock data
    const mockArtisans = MOCK_ARTISANS.filter(artisan => {
      // Simple distance calculation mock
      const distance = Math.sqrt(
        Math.pow(artisan.location.coordinates[0] - location.latitude, 2) +
        Math.pow(artisan.location.coordinates[1] - location.longitude, 2)
      );
      return distance <= radius / 111; // Rough conversion to degrees
    });
    
    return mockArtisans;
  }

  // Service Requests
  async createServiceRequest(data: any): Promise<ServiceRequest> {
    const { data: request, error } = await supabase
      .from('service_requests')
      .insert({
        customer_id: data.customerId,
        title: data.title,
        description: data.description,
        category_id: data.categoryId,
        location: data.location,
        images: data.images || [],
        urgency: data.urgency,
        budget: data.budget,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime,
        requirements: data.requirements || [],
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        customer:users(*),
        category:service_categories(*)
      `)
      .single();

    if (error) throw error;
    return this.transformServiceRequest(request);
  }

  async getCustomerRequests(customerId: string): Promise<ServiceRequest[]> {
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        customer:users(*),
        category:service_categories(*),
        assigned_artisan:artisans(*, user:users(*)),
        quotes:service_quotes(*, artisan:artisans(*, user:users(*))),
        payment:service_payments(*),
        chat:service_chats(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return requests.map(this.transformServiceRequest);
  }

  async getArtisanRequests(artisanId: string): Promise<ServiceRequest[]> {
    // Get requests where artisan has been assigned or can quote
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        customer:users(*),
        category:service_categories(*),
        assigned_artisan:artisans(*, user:users(*)),
        quotes:service_quotes(*, artisan:artisans(*, user:users(*))),
        payment:service_payments(*),
        chat:service_chats(*)
      `)
      .or(`assigned_artisan_id.eq.${artisanId},status.in.(pending,quoted)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return requests.map(this.transformServiceRequest);
  }

  async updateServiceRequestStatus(requestId: string, status: string): Promise<ServiceRequest> {
    const { data: request, error } = await supabase
      .from('service_requests')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select(`
        *,
        customer:users(*),
        category:service_categories(*),
        assigned_artisan:artisans(*, user:users(*))
      `)
      .single();

    if (error) throw error;
    return this.transformServiceRequest(request);
  }

  // Quotes
  async submitQuote(requestId: string, quoteData: any): Promise<ServiceQuote> {
    const { data: quote, error } = await supabase
      .from('service_quotes')
      .insert({
        request_id: requestId,
        artisan_id: quoteData.artisanId,
        price: quoteData.price,
        currency: quoteData.currency || 'NGN',
        description: quoteData.description,
        estimated_duration: quoteData.estimatedDuration,
        materials: quoteData.materials || [],
        available_from: quoteData.availableFrom,
        expires_at: quoteData.expiresAt,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        artisan:artisans(*, user:users(*))
      `)
      .single();

    if (error) throw error;
    return this.transformServiceQuote(quote);
  }

  async getArtisanQuotes(artisanId: string): Promise<ServiceQuote[]> {
    const { data: quotes, error } = await supabase
      .from('service_quotes')
      .select(`
        *,
        artisan:artisans(*, user:users(*)),
        request:service_requests(*, customer:users(*))
      `)
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return quotes.map(this.transformServiceQuote);
  }

  async acceptQuote(quoteId: string): Promise<ServiceQuote> {
    const { data: quote, error } = await supabase
      .from('service_quotes')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select(`
        *,
        artisan:artisans(*, user:users(*))
      `)
      .single();

    if (error) throw error;

    // Update service request to assign artisan
    await supabase
      .from('service_requests')
      .update({
        status: 'assigned',
        assigned_artisan_id: quote.artisan_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quote.request_id);

    return this.transformServiceQuote(quote);
  }

  async rejectQuote(quoteId: string): Promise<ServiceQuote> {
    const { data: quote, error } = await supabase
      .from('service_quotes')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select(`
        *,
        artisan:artisans(*, user:users(*))
      `)
      .single();

    if (error) throw error;
    return this.transformServiceQuote(quote);
  }

  // Chat System
  async createChat(requestId: string, participants: string[]): Promise<ServiceChat> {
    const { data: chat, error } = await supabase
      .from('service_chats')
      .insert({
        request_id: requestId,
        participants: participants,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.transformServiceChat(chat);
  }

  async sendMessage(chatId: string, messageData: any): Promise<ChatMessage> {
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        sender_id: messageData.senderId,
        message: messageData.message,
        type: messageData.type || 'text',
        attachments: messageData.attachments || [],
        sent_at: new Date().toISOString(),
      })
      .select(`
        *,
        sender:users(*)
      `)
      .single();

    if (error) throw error;
    return this.transformChatMessage(message);
  }

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users(*)
      `)
      .eq('chat_id', chatId)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return messages.map(this.transformChatMessage);
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    // Mock implementation - would update message read status in database
    console.log(`Marking messages as read for chat ${chatId} by user ${userId}`);
  }

  // Reviews
  async createReview(reviewData: any): Promise<ServiceReview> {
    const { data: review, error } = await supabase
      .from('service_reviews')
      .insert({
        request_id: reviewData.requestId,
        customer_id: reviewData.customerId,
        artisan_id: reviewData.artisanId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || [],
        qualities: reviewData.qualities || [],
        would_recommend: reviewData.wouldRecommend,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        customer:users(*),
        artisan:artisans(*, user:users(*))
      `)
      .single();

    if (error) throw error;
    return this.transformServiceReview(review);
  }

  async getArtisanReviews(artisanId: string): Promise<ServiceReview[]> {
    const { data: reviews, error } = await supabase
      .from('service_reviews')
      .select(`
        *,
        customer:users(*),
        artisan:artisans(*, user:users(*))
      `)
      .eq('artisan_id', artisanId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return reviews.map(this.transformServiceReview);
  }

  // Analytics
  async getArtisanAnalytics(artisanId: string): Promise<ArtisanAnalytics> {
    // Mock implementation - would fetch analytics from database
    console.log(`Getting analytics for artisan: ${artisanId}`);
    return {
      totalJobs: 45,
      completedJobs: 42,
      totalEarnings: 125000,
      averageRating: 4.8,
      responseTime: 2.5,
      popularServices: ['Plumbing', 'Electrical']
    } as ArtisanAnalytics;
  }

  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    // Mock implementation - would fetch analytics from database
    console.log(`Getting analytics for customer: ${customerId}`);
    return {
      totalRequests: 12,
      completedRequests: 10,
      totalSpent: 45000,
      favoriteCategories: ['Plumbing', 'Cleaning'],
      averageRating: 4.5
    } as CustomerAnalytics;
  }

  // Payments
  async createEscrowPayment(requestId: string, amount: number): Promise<any> {
    const { data: payment, error } = await supabase
      .from('service_payments')
      .insert({
        request_id: requestId,
        amount: amount,
        currency: 'NGN',
        status: 'pending',
        escrow_status: 'held',
        platform_fee: amount * 0.05, // 5% platform fee
        artisan_amount: amount * 0.95,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return payment;
  }

  async releaseEscrowPayment(paymentId: string): Promise<any> {
    const { data: payment, error } = await supabase
      .from('service_payments')
      .update({
        status: 'released',
        escrow_status: 'released',
        released_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select('*')
      .single();

    if (error) throw error;
    return payment;
  }

  // File Upload
  async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    // Mock implementation - would use Prisma/cloud storage
    console.log(`Uploading file to bucket ${bucket} at path ${path}`);
    return `/uploads/${bucket}/${path}`;
  }

  // Helper methods for data transformation
  private transformArtisan(data: any): Artisan {
    return {
      id: data.id,
      userId: data.user_id,
      user: data.user,
      businessName: data.business_name,
      description: data.description,
      categories: data.categories || [],
      skills: data.skills || [],
      experience: data.experience,
      hourlyRate: data.hourly_rate,
      location: data.location,
      serviceArea: data.service_area,
      portfolio: data.portfolio || [],
      certifications: data.certifications || [],
      rating: data.rating || 0,
      reviewCount: data.review_count || 0,
      completedJobs: data.completed_jobs || 0,
      responseTime: data.response_time || 0,
      availability: data.availability,
      isVerified: data.is_verified || false,
      isOnline: data.is_online || false,
      isActive: data.is_active || true,
      joinedAt: data.joined_at,
      lastActive: data.last_active,
    };
  }

  private transformServiceCategory(data: any): ServiceCategory {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      parentId: data.parent_id,
      children: data.children,
      isActive: data.is_active,
    };
  }

  private transformServiceRequest(data: any): ServiceRequest {
    return {
      id: data.id,
      customerId: data.customer_id,
      customer: data.customer,
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      images: data.images || [],
      urgency: data.urgency,
      budget: data.budget,
      preferredDate: data.preferred_date,
      preferredTime: data.preferred_time,
      requirements: data.requirements || [],
      status: data.status,
      assignedArtisanId: data.assigned_artisan_id,
      assignedArtisan: data.assigned_artisan,
      quotes: data.quotes || [],
      payment: data.payment,
      chat: data.chat,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private transformServiceQuote(data: any): ServiceQuote {
    return {
      id: data.id,
      requestId: data.request_id,
      artisanId: data.artisan_id,
      artisan: data.artisan,
      price: data.price,
      currency: data.currency,
      description: data.description,
      estimatedDuration: data.estimated_duration,
      materials: data.materials || [],
      availableFrom: data.available_from,
      expiresAt: data.expires_at,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private transformServiceChat(data: any): ServiceChat {
    return {
      id: data.id,
      requestId: data.request_id,
      participants: data.participants,
      messages: data.messages || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private transformChatMessage(data: any): ChatMessage {
    return {
      id: data.id,
      senderId: data.sender_id,
      sender: data.sender,
      message: data.message,
      type: data.type,
      attachments: data.attachments,
      readBy: data.read_by || [],
      sentAt: data.sent_at,
    };
  }

  private transformServiceReview(data: any): ServiceReview {
    return {
      id: data.id,
      requestId: data.request_id,
      customerId: data.customer_id,
      customer: data.customer,
      artisanId: data.artisan_id,
      artisan: data.artisan,
      rating: data.rating,
      comment: data.comment,
      images: data.images || [],
      qualities: data.qualities || [],
      wouldRecommend: data.would_recommend,
      createdAt: data.created_at,
    };
  }
}

export const artisanService = new ArtisanService();
