import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Artisan', 'ServiceRequest', 'Quote', 'Job', 'Notification'],
  endpoints: (builder) => ({
    // User endpoints
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Product endpoints
    getProducts: builder.query({
      query: ({ page = 1, limit = 20, category, search } = {}) => ({
        url: '/products',
        params: { page, limit, category, search },
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),

    // Artisan endpoints
    getArtisans: builder.query({
      query: ({ category, location, search } = {}) => ({
        url: '/artisans',
        params: { category, location, search },
      }),
      providesTags: ['Artisan'],
    }),
    getArtisan: builder.query({
      query: (id) => `/artisans/${id}`,
      providesTags: ['Artisan'],
    }),
    updateArtisanAvailability: builder.mutation({
      query: ({ artisanId, status }) => ({
        url: `/artisans/${artisanId}/availability`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Artisan'],
    }),

    // Service Request endpoints
    getServiceRequests: builder.query({
      query: ({ status, artisanId } = {}) => ({
        url: '/service-requests',
        params: { status, artisan_id: artisanId },
      }),
      providesTags: ['ServiceRequest'],
    }),
    createServiceRequest: builder.mutation({
      query: (requestData) => ({
        url: '/service-requests',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['ServiceRequest'],
    }),
    updateServiceRequest: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/service-requests/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['ServiceRequest'],
    }),

    // Quote endpoints
    getQuotes: builder.query({
      query: ({ requestId, artisanId } = {}) => ({
        url: '/quotes',
        params: { request_id: requestId, artisan_id: artisanId },
      }),
      providesTags: ['Quote'],
    }),
    createQuote: builder.mutation({
      query: (quoteData) => ({
        url: '/quotes',
        method: 'POST',
        body: quoteData,
      }),
      invalidatesTags: ['Quote', 'ServiceRequest'],
    }),
    acceptQuote: builder.mutation({
      query: (quoteId) => ({
        url: `/quotes/${quoteId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Quote', 'Job'],
    }),

    // Job endpoints
    getJobs: builder.query({
      query: ({ status, artisanId, customerId } = {}) => ({
        url: '/jobs',
        params: { status, artisan_id: artisanId, customer_id: customerId },
      }),
      providesTags: ['Job'],
    }),
    updateJobStatus: builder.mutation({
      query: ({ jobId, status }) => ({
        url: `/jobs/${jobId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Job'],
    }),

    // Notification endpoints
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/notifications',
        params: { page, limit },
      }),
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    registerPushToken: builder.mutation({
      query: (token) => ({
        url: '/notifications/push-token',
        method: 'POST',
        body: { token },
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useGetArtisansQuery,
  useGetArtisanQuery,
  useUpdateArtisanAvailabilityMutation,
  useGetServiceRequestsQuery,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestMutation,
  useGetQuotesQuery,
  useCreateQuoteMutation,
  useAcceptQuoteMutation,
  useGetJobsQuery,
  useUpdateJobStatusMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useRegisterPushTokenMutation,
} = apiSlice;
