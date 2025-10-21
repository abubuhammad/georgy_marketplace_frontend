import { useState, useCallback } from 'react';
import { 
  adminApiService, 
  RevenueShareScheme, 
  TaxRule, 
  PaymentAnalytics, 
  RevenueBreakdown,
  Payout,
  PaymentConfig
} from '../services/api/adminApiService';

interface UseAdminState {
  loading: boolean;
  error: string | null;
  revenueSchemes: RevenueShareScheme[];
  taxRules: TaxRule[];
  analytics: PaymentAnalytics | null;
  revenueBreakdown: RevenueBreakdown | null;
  pendingPayouts: Payout[];
  paymentConfig: PaymentConfig | null;
}

export const useAdmin = () => {
  const [state, setState] = useState<UseAdminState>({
    loading: false,
    error: null,
    revenueSchemes: [],
    taxRules: [],
    analytics: null,
    revenueBreakdown: null,
    pendingPayouts: [],
    paymentConfig: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Revenue Share Schemes
  const createRevenueShareScheme = useCallback(async (data: Omit<RevenueShareScheme, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const scheme = await adminApiService.createRevenueShareScheme(data);
      setState(prev => ({ 
        ...prev, 
        revenueSchemes: [scheme, ...prev.revenueSchemes] 
      }));
      
      return scheme;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create revenue share scheme';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getRevenueShareSchemes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const schemes = await adminApiService.getRevenueShareSchemes();
      setState(prev => ({ ...prev, revenueSchemes: schemes }));
      
      return schemes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch revenue share schemes';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateRevenueShareScheme = useCallback(async (id: string, data: Partial<RevenueShareScheme>) => {
    try {
      setLoading(true);
      setError(null);
      
      const scheme = await adminApiService.updateRevenueShareScheme(id, data);
      setState(prev => ({ 
        ...prev, 
        revenueSchemes: prev.revenueSchemes.map(s => s.id === id ? scheme : s)
      }));
      
      return scheme;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update revenue share scheme';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deleteRevenueShareScheme = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await adminApiService.deleteRevenueShareScheme(id);
      setState(prev => ({ 
        ...prev, 
        revenueSchemes: prev.revenueSchemes.filter(s => s.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete revenue share scheme';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Tax Rules
  const createTaxRule = useCallback(async (data: Omit<TaxRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const taxRule = await adminApiService.createTaxRule(data);
      setState(prev => ({ 
        ...prev, 
        taxRules: [taxRule, ...prev.taxRules] 
      }));
      
      return taxRule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tax rule';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getTaxRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const taxRules = await adminApiService.getTaxRules();
      setState(prev => ({ ...prev, taxRules }));
      
      return taxRules;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tax rules';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateTaxRule = useCallback(async (id: string, data: Partial<TaxRule>) => {
    try {
      setLoading(true);
      setError(null);
      
      const taxRule = await adminApiService.updateTaxRule(id, data);
      setState(prev => ({ 
        ...prev, 
        taxRules: prev.taxRules.map(t => t.id === id ? taxRule : t)
      }));
      
      return taxRule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tax rule';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deleteTaxRule = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await adminApiService.deleteTaxRule(id);
      setState(prev => ({ 
        ...prev, 
        taxRules: prev.taxRules.filter(t => t.id !== id)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete tax rule';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Analytics
  const getPaymentAnalytics = useCallback(async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const analytics = await adminApiService.getPaymentAnalytics(params);
      setState(prev => ({ ...prev, analytics }));
      
      return analytics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment analytics';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getRevenueBreakdown = useCallback(async (params?: { period?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const breakdown = await adminApiService.getRevenueBreakdown(params);
      setState(prev => ({ ...prev, revenueBreakdown: breakdown }));
      
      return breakdown;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch revenue breakdown';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Payout Management
  const getPendingPayouts = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await adminApiService.getPendingPayouts(params);
      setState(prev => ({ ...prev, pendingPayouts: result.payouts }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pending payouts';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const processPayouts = useCallback(async (payoutIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await adminApiService.processPayouts(payoutIds);
      
      // Remove processed payouts from state
      const processedIds = results.filter(r => r.success).map(r => r.payoutId);
      setState(prev => ({ 
        ...prev, 
        pendingPayouts: prev.pendingPayouts.filter(p => !processedIds.includes(p.id))
      }));
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payouts';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Configuration
  const getPaymentConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await adminApiService.getPaymentConfig();
      setState(prev => ({ ...prev, paymentConfig: config }));
      
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment config';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updatePaymentConfig = useCallback(async (config: Partial<PaymentConfig>) => {
    try {
      setLoading(true);
      setError(null);
      
      await adminApiService.updatePaymentConfig(config);
      setState(prev => ({ 
        ...prev, 
        paymentConfig: prev.paymentConfig ? { ...prev.paymentConfig, ...config } : null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payment config';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    ...state,
    createRevenueShareScheme,
    getRevenueShareSchemes,
    updateRevenueShareScheme,
    deleteRevenueShareScheme,
    createTaxRule,
    getTaxRules,
    updateTaxRule,
    deleteTaxRule,
    getPaymentAnalytics,
    getRevenueBreakdown,
    getPendingPayouts,
    processPayouts,
    getPaymentConfig,
    updatePaymentConfig
  };
};
