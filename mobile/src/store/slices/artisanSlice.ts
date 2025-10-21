import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Artisan, ServiceRequest, Quote, Job } from '../../types/Artisan';

interface ArtisanState {
  artisans: Artisan[];
  nearbyArtisans: Artisan[];
  serviceRequests: ServiceRequest[];
  quotes: Quote[];
  jobs: Job[];
  loading: boolean;
  selectedCategory: string | null;
  searchQuery: string;
}

const initialState: ArtisanState = {
  artisans: [],
  nearbyArtisans: [],
  serviceRequests: [],
  quotes: [],
  jobs: [],
  loading: false,
  selectedCategory: null,
  searchQuery: '',
};

export const artisanSlice = createSlice({
  name: 'artisan',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setArtisans: (state, action: PayloadAction<Artisan[]>) => {
      state.artisans = action.payload;
    },
    setNearbyArtisans: (state, action: PayloadAction<Artisan[]>) => {
      state.nearbyArtisans = action.payload;
    },
    setServiceRequests: (state, action: PayloadAction<ServiceRequest[]>) => {
      state.serviceRequests = action.payload;
    },
    addServiceRequest: (state, action: PayloadAction<ServiceRequest>) => {
      state.serviceRequests.unshift(action.payload);
    },
    updateServiceRequest: (state, action: PayloadAction<{ id: string; updates: Partial<ServiceRequest> }>) => {
      const { id, updates } = action.payload;
      const index = state.serviceRequests.findIndex(request => request.id === id);
      if (index !== -1) {
        state.serviceRequests[index] = { ...state.serviceRequests[index], ...updates };
      }
    },
    setQuotes: (state, action: PayloadAction<Quote[]>) => {
      state.quotes = action.payload;
    },
    addQuote: (state, action: PayloadAction<Quote>) => {
      state.quotes.unshift(action.payload);
    },
    updateQuote: (state, action: PayloadAction<{ id: string; updates: Partial<Quote> }>) => {
      const { id, updates } = action.payload;
      const index = state.quotes.findIndex(quote => quote.id === id);
      if (index !== -1) {
        state.quotes[index] = { ...state.quotes[index], ...updates };
      }
    },
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    addJob: (state, action: PayloadAction<Job>) => {
      state.jobs.unshift(action.payload);
    },
    updateJob: (state, action: PayloadAction<{ id: string; updates: Partial<Job> }>) => {
      const { id, updates } = action.payload;
      const index = state.jobs.findIndex(job => job.id === id);
      if (index !== -1) {
        state.jobs[index] = { ...state.jobs[index], ...updates };
      }
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    updateArtisanAvailability: (state, action: PayloadAction<{ artisanId: string; status: 'available' | 'busy' | 'offline' }>) => {
      const { artisanId, status } = action.payload;
      
      // Update in artisans array
      const artisanIndex = state.artisans.findIndex(artisan => artisan.id === artisanId);
      if (artisanIndex !== -1) {
        state.artisans[artisanIndex].availability_status = status;
      }
      
      // Update in nearby artisans array
      const nearbyIndex = state.nearbyArtisans.findIndex(artisan => artisan.id === artisanId);
      if (nearbyIndex !== -1) {
        state.nearbyArtisans[nearbyIndex].availability_status = status;
      }
    },
  },
});

export const {
  setLoading,
  setArtisans,
  setNearbyArtisans,
  setServiceRequests,
  addServiceRequest,
  updateServiceRequest,
  setQuotes,
  addQuote,
  updateQuote,
  setJobs,
  addJob,
  updateJob,
  setSelectedCategory,
  setSearchQuery,
  updateArtisanAvailability,
} = artisanSlice.actions;
