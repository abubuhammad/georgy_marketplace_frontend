import { useState, useCallback } from 'react';
import { paymentApiService, PaymentCalculation, PaymentInitiation, Payment, EscrowRelease } from '../services/api/paymentApiService';

interface UsePaymentState {
  loading: boolean;
  error: string | null;
  calculation: PaymentCalculation | null;
  payment: Payment | null;
  paymentHistory: Payment[];
}

export const usePayment = () => {
  const [state, setState] = useState<UsePaymentState>({
    loading: false,
    error: null,
    calculation: null,
    payment: null,
    paymentHistory: []
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const calculatePayment = useCallback(async (data: {
    amount: number;
    category?: string;
    sellerTier?: 'standard' | 'premium' | 'enterprise';
    currency?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const calculation = await paymentApiService.calculatePayment(data);
      setState(prev => ({ ...prev, calculation }));
      
      return calculation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate payment';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const initiatePayment = useCallback(async (data: PaymentInitiation) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await paymentApiService.initiatePayment(data);
      setState(prev => ({ ...prev, payment: result.payment }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const verifyPayment = useCallback(async (reference: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const payment = await paymentApiService.verifyPayment(reference);
      setState(prev => ({ ...prev, payment }));
      
      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const releaseEscrow = useCallback(async (data: EscrowRelease) => {
    try {
      setLoading(true);
      setError(null);
      
      const payment = await paymentApiService.releaseEscrow(data);
      setState(prev => ({ ...prev, payment }));
      
      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to release escrow';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getPaymentHistory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const history = await paymentApiService.getPaymentHistory(params);
      setState(prev => ({ ...prev, paymentHistory: history.payments }));
      
      return history;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment history';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const generateInvoice = useCallback(async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const invoice = await paymentApiService.generateInvoice(paymentId);
      return invoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const processRefund = useCallback(async (paymentId: string, data: { amount: number; reason: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await paymentApiService.processRefund(paymentId, data);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process refund';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    ...state,
    calculatePayment,
    initiatePayment,
    verifyPayment,
    releaseEscrow,
    getPaymentHistory,
    generateInvoice,
    processRefund
  };
};
