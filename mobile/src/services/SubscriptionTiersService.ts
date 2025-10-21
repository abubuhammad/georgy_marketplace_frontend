export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'standard' | 'premium' | 'enterprise';
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  commissionRate: number;
  features: SubscriptionFeature[];
  limits: SubscriptionLimits;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'analytics' | 'support' | 'payment' | 'business' | 'tools';
  included: boolean;
  limit?: number;
  unit?: string;
  highlight?: boolean;
}

export interface SubscriptionLimits {
  maxActiveJobs: number;
  maxMonthlyRequests: number;
  maxPortfolioImages: number;
  maxBusinessHours: number;
  analyticsRetentionDays: number;
  supportResponseTime: number; // hours
  apiCallsPerMonth: number;
  customReportsPerMonth: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial' | 'suspended';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  trialEndDate?: string;
  cancelledAt?: string;
  suspendedAt?: string;
  autoRenew: boolean;
  paymentMethodId?: string;
  promoCode?: string;
  discountAmount?: number;
  metadata: {
    upgradedFrom?: string;
    downgradedFrom?: string;
    reasonForChange?: string;
    supportTickets: number;
    featureUsage: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionUsage {
  userId: string;
  period: string; // YYYY-MM format
  usage: {
    activeJobs: number;
    monthlyRequests: number;
    portfolioImages: number;
    apiCalls: number;
    customReports: number;
    supportTickets: number;
    businessHoursClaimed: number;
  };
  limits: SubscriptionLimits;
  overageCharges: {
    feature: string;
    overage: number;
    rate: number;
    charge: number;
  }[];
  totalOverageCharge: number;
}

export interface SubscriptionBenefit {
  type: 'commission_reduction' | 'priority_listing' | 'analytics_access' | 'support_priority' | 'business_tools' | 'marketing_boost';
  value: number | boolean | string;
  description: string;
  quantifiable: boolean;
}

export class SubscriptionTiersService {
  private plans: SubscriptionPlan[] = [];

  constructor() {
    this.initializePlans();
  }

  // Initialize subscription plans
  private initializePlans(): void {
    this.plans = [
      {
        id: 'standard_monthly',
        name: 'Standard',
        tier: 'standard',
        description: 'Perfect for individual artisans getting started',
        price: 0,
        currency: 'NGN',
        billingPeriod: 'monthly',
        commissionRate: 10,
        features: this.getStandardFeatures(),
        limits: {
          maxActiveJobs: 10,
          maxMonthlyRequests: 50,
          maxPortfolioImages: 20,
          maxBusinessHours: 40,
          analyticsRetentionDays: 30,
          supportResponseTime: 48,
          apiCallsPerMonth: 1000,
          customReportsPerMonth: 1,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'premium_monthly',
        name: 'Premium',
        tier: 'premium',
        description: 'Best for growing businesses with advanced needs',
        price: 15000,
        currency: 'NGN',
        billingPeriod: 'monthly',
        commissionRate: 8,
        features: this.getPremiumFeatures(),
        limits: {
          maxActiveJobs: 50,
          maxMonthlyRequests: 200,
          maxPortfolioImages: 100,
          maxBusinessHours: 80,
          analyticsRetentionDays: 90,
          supportResponseTime: 24,
          apiCallsPerMonth: 5000,
          customReportsPerMonth: 5,
        },
        isPopular: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'enterprise_monthly',
        name: 'Enterprise',
        tier: 'enterprise',
        description: 'For established businesses requiring premium support',
        price: 45000,
        currency: 'NGN',
        billingPeriod: 'monthly',
        commissionRate: 6,
        features: this.getEnterpriseFeatures(),
        limits: {
          maxActiveJobs: -1, // unlimited
          maxMonthlyRequests: -1,
          maxPortfolioImages: -1,
          maxBusinessHours: 160,
          analyticsRetentionDays: 365,
          supportResponseTime: 4,
          apiCallsPerMonth: 25000,
          customReportsPerMonth: -1,
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Get standard features
  private getStandardFeatures(): SubscriptionFeature[] {
    return [
      {
        id: 'basic_listing',
        name: 'Basic Profile Listing',
        description: 'Standard visibility in search results',
        category: 'marketing',
        included: true,
      },
      {
        id: 'portfolio_basic',
        name: 'Portfolio Showcase',
        description: 'Upload up to 20 portfolio images',
        category: 'marketing',
        included: true,
        limit: 20,
        unit: 'images',
      },
      {
        id: 'basic_analytics',
        name: 'Basic Analytics',
        description: 'View basic performance metrics',
        category: 'analytics',
        included: true,
      },
      {
        id: 'standard_support',
        name: '48h Customer Support',
        description: 'Email support with 48-hour response time',
        category: 'support',
        included: true,
      },
      {
        id: 'secure_payments',
        name: 'Secure Payment Processing',
        description: 'Safe and secure transaction handling',
        category: 'payment',
        included: true,
      },
      {
        id: 'job_management',
        name: 'Job Management Tools',
        description: 'Manage up to 10 active jobs',
        category: 'business',
        included: true,
        limit: 10,
        unit: 'jobs',
      },
    ];
  }

  // Get premium features
  private getPremiumFeatures(): SubscriptionFeature[] {
    const standardFeatures = this.getStandardFeatures();
    
    return [
      ...standardFeatures.map(f => ({
        ...f,
        limit: f.id === 'portfolio_basic' ? 100 : f.id === 'job_management' ? 50 : f.limit,
        description: f.id === 'standard_support' ? 'Priority email support with 24-hour response time' : f.description,
      })),
      {
        id: 'priority_listing',
        name: 'Priority Listing',
        description: 'Higher visibility in search results',
        category: 'marketing',
        included: true,
        highlight: true,
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Detailed performance insights and customer behavior',
        category: 'analytics',
        included: true,
        highlight: true,
      },
      {
        id: 'promotional_features',
        name: 'Promotional Tools',
        description: 'Run special offers and discounts',
        category: 'marketing',
        included: true,
      },
      {
        id: 'bulk_messaging',
        name: 'Bulk Customer Messaging',
        description: 'Send updates to multiple customers',
        category: 'business',
        included: true,
      },
      {
        id: 'custom_branding',
        name: 'Custom Branding',
        description: 'Customize your profile appearance',
        category: 'marketing',
        included: true,
      },
      {
        id: 'commission_reduction',
        name: 'Reduced Commission (8%)',
        description: 'Lower platform fees for more earnings',
        category: 'payment',
        included: true,
        highlight: true,
      },
    ];
  }

  // Get enterprise features
  private getEnterpriseFeatures(): SubscriptionFeature[] {
    const premiumFeatures = this.getPremiumFeatures();
    
    return [
      ...premiumFeatures.map(f => ({
        ...f,
        limit: f.limit && f.limit > 0 ? -1 : f.limit, // Make most limits unlimited
        description: f.id === 'standard_support' ? 'Dedicated account manager with 4-hour response time' : 
                    f.id === 'commission_reduction' ? 'Lowest commission rate (6%)' : f.description,
      })),
      {
        id: 'dedicated_manager',
        name: 'Dedicated Account Manager',
        description: 'Personal support representative',
        category: 'support',
        included: true,
        highlight: true,
      },
      {
        id: 'custom_reporting',
        name: 'Custom Reports',
        description: 'Generate tailored business reports',
        category: 'analytics',
        included: true,
        highlight: true,
      },
      {
        id: 'api_access',
        name: 'API Access',
        description: 'Integrate with your business tools',
        category: 'tools',
        included: true,
      },
      {
        id: 'white_label',
        name: 'White-label Options',
        description: 'Custom branding for your business',
        category: 'business',
        included: true,
      },
      {
        id: 'bulk_operations',
        name: 'Bulk Operations',
        description: 'Process multiple jobs and payments at once',
        category: 'tools',
        included: true,
      },
      {
        id: 'priority_placement',
        name: 'Premium Placement',
        description: 'Featured placement in search results',
        category: 'marketing',
        included: true,
        highlight: true,
      },
    ];
  }

  // Get all subscription plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return this.plans.filter(plan => plan.isActive);
  }

  // Get specific plan by ID
  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.find(plan => plan.id === planId) || null;
  }

  // Get plans by tier
  getPlansByTier(tier: SubscriptionPlan['tier']): SubscriptionPlan[] {
    return this.plans.filter(plan => plan.tier === tier && plan.isActive);
  }

  // Subscribe user to a plan
  async subscribeUser(
    userId: string,
    planId: string,
    paymentMethodId?: string,
    promoCode?: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    try {
      const plan = this.getPlan(planId);
      if (!plan) {
        return { success: false, error: 'Subscription plan not found' };
      }

      // Check if user already has active subscription
      const existingSubscription = await this.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return { success: false, error: 'User already has an active subscription' };
      }

      // Process payment if required
      if (plan.price > 0) {
        const paymentResult = await this.processSubscriptionPayment(userId, plan, paymentMethodId, promoCode);
        if (!paymentResult.success) {
          return { success: false, error: paymentResult.error };
        }
      }

      // Create subscription
      const subscription = await this.createSubscription(userId, plan, promoCode);
      
      // Update user's commission rate
      await this.updateUserCommissionRate(userId, plan.commissionRate);

      return { success: true, subscription };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription'
      };
    }
  }

  // Upgrade user subscription
  async upgradeSubscription(
    userId: string,
    newPlanId: string,
    reason?: string
  ): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    try {
      const currentSubscription = await this.getUserSubscription(userId);
      if (!currentSubscription || currentSubscription.status !== 'active') {
        return { success: false, error: 'No active subscription found' };
      }

      const newPlan = this.getPlan(newPlanId);
      const currentPlan = this.getPlan(currentSubscription.planId);
      
      if (!newPlan || !currentPlan) {
        return { success: false, error: 'Invalid subscription plan' };
      }

      // Validate upgrade path
      const tierHierarchy = { standard: 0, premium: 1, enterprise: 2 };
      if (tierHierarchy[newPlan.tier] <= tierHierarchy[currentPlan.tier]) {
        return { success: false, error: 'Cannot upgrade to a lower or same tier plan' };
      }

      // Calculate prorated charges
      const proratedCharge = await this.calculateProratedCharge(currentSubscription, newPlan);
      
      // Process payment for upgrade
      if (proratedCharge > 0) {
        const paymentResult = await this.processUpgradePayment(userId, proratedCharge);
        if (!paymentResult.success) {
          return { success: false, error: paymentResult.error };
        }
      }

      // Update subscription
      const updatedSubscription = await this.updateSubscription(currentSubscription.id, {
        planId: newPlanId,
        metadata: {
          ...currentSubscription.metadata,
          upgradedFrom: currentPlan.id,
          reasonForChange: reason,
        },
      });

      // Update commission rate immediately
      await this.updateUserCommissionRate(userId, newPlan.commissionRate);

      return { success: true, subscription: updatedSubscription };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upgrade subscription'
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(
    userId: string,
    reason?: string,
    immediate: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription || subscription.status !== 'active') {
        return { success: false, error: 'No active subscription found' };
      }

      const cancellationDate = immediate ? new Date() : new Date(subscription.endDate);
      
      await this.updateSubscription(subscription.id, {
        status: immediate ? 'cancelled' : 'active',
        autoRenew: false,
        cancelledAt: cancellationDate.toISOString(),
        metadata: {
          ...subscription.metadata,
          reasonForChange: reason,
        },
      });

      if (immediate) {
        // Revert to standard plan immediately
        await this.updateUserCommissionRate(userId, 10);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription'
      };
    }
  }

  // Get subscription benefits comparison
  getSubscriptionComparison(): {
    tiers: string[];
    features: { name: string; standard: boolean | string; premium: boolean | string; enterprise: boolean | string }[];
    pricing: { tier: string; price: number; savings?: string }[];
  } {
    const standardPlan = this.getPlansByTier('standard')[0];
    const premiumPlan = this.getPlansByTier('premium')[0];
    const enterprisePlan = this.getPlansByTier('enterprise')[0];

    const allFeatureNames = new Set([
      ...standardPlan.features.map(f => f.name),
      ...premiumPlan.features.map(f => f.name),
      ...enterprisePlan.features.map(f => f.name),
    ]);

    const features = Array.from(allFeatureNames).map(featureName => {
      const standardFeature = standardPlan.features.find(f => f.name === featureName);
      const premiumFeature = premiumPlan.features.find(f => f.name === featureName);
      const enterpriseFeature = enterprisePlan.features.find(f => f.name === featureName);

      return {
        name: featureName,
        standard: standardFeature ? (standardFeature.limit ? `${standardFeature.limit} ${standardFeature.unit || ''}`.trim() : true) : false,
        premium: premiumFeature ? (premiumFeature.limit ? `${premiumFeature.limit === -1 ? 'Unlimited' : premiumFeature.limit} ${premiumFeature.unit || ''}`.trim() : true) : false,
        enterprise: enterpriseFeature ? (enterpriseFeature.limit ? `${enterpriseFeature.limit === -1 ? 'Unlimited' : enterpriseFeature.limit} ${enterpriseFeature.unit || ''}`.trim() : true) : false,
      };
    });

    return {
      tiers: ['Standard', 'Premium', 'Enterprise'],
      features,
      pricing: [
        { tier: 'Standard', price: 0 },
        { tier: 'Premium', price: 15000, savings: 'Save ₦36,000/year on commissions' },
        { tier: 'Enterprise', price: 45000, savings: 'Save ₦108,000/year on commissions' },
      ],
    };
  }

  // Check feature access
  checkFeatureAccess(userSubscription: UserSubscription, featureId: string): { hasAccess: boolean; limit?: number; used?: number } {
    const plan = this.getPlan(userSubscription.planId);
    if (!plan) {
      return { hasAccess: false };
    }

    const feature = plan.features.find(f => f.id === featureId);
    if (!feature || !feature.included) {
      return { hasAccess: false };
    }

    const usage = userSubscription.metadata.featureUsage[featureId] || 0;
    const limit = feature.limit || -1;

    return {
      hasAccess: limit === -1 || usage < limit,
      limit: limit === -1 ? undefined : limit,
      used: usage,
    };
  }

  // Calculate monthly savings from commission reduction
  calculateCommissionSavings(monthlyEarnings: number, currentTier: string, targetTier: string): number {
    const currentPlan = this.getPlansByTier(currentTier as SubscriptionPlan['tier'])[0];
    const targetPlan = this.getPlansByTier(targetTier as SubscriptionPlan['tier'])[0];
    
    if (!currentPlan || !targetPlan) return 0;

    const currentCommission = monthlyEarnings * (currentPlan.commissionRate / 100);
    const targetCommission = monthlyEarnings * (targetPlan.commissionRate / 100);
    
    return currentCommission - targetCommission;
  }

  // Private helper methods
  private async processSubscriptionPayment(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethodId?: string,
    promoCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with payment gateway
    console.log(`Processing subscription payment: ₦${plan.price.toLocaleString()} for ${plan.name}`);
    return { success: true };
  }

  private async processUpgradePayment(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    // TODO: Integrate with payment gateway
    console.log(`Processing upgrade payment: ₦${amount.toLocaleString()}`);
    return { success: true };
  }

  private async createSubscription(userId: string, plan: SubscriptionPlan, promoCode?: string): Promise<UserSubscription> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (plan.billingPeriod === 'yearly' ? 12 : 1));

    const subscription: UserSubscription = {
      id: `sub_${userId}_${Date.now()}`,
      userId,
      planId: plan.id,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      nextBillingDate: endDate.toISOString(),
      autoRenew: true,
      promoCode,
      metadata: {
        supportTickets: 0,
        featureUsage: {},
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // TODO: Save to database
    console.log('Creating subscription:', subscription);
    return subscription;
  }

  private async updateSubscription(subscriptionId: string, updates: Partial<UserSubscription>): Promise<UserSubscription> {
    // TODO: Update in database
    console.log('Updating subscription:', subscriptionId, updates);
    return {} as UserSubscription;
  }

  private async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    // TODO: Fetch from database
    console.log('Fetching user subscription:', userId);
    return null;
  }

  private async updateUserCommissionRate(userId: string, rate: number): Promise<void> {
    // TODO: Update user's commission rate in database
    console.log(`Updating commission rate for user ${userId} to ${rate}%`);
  }

  private async calculateProratedCharge(subscription: UserSubscription, newPlan: SubscriptionPlan): Promise<number> {
    // TODO: Calculate prorated charge based on remaining days
    return newPlan.price * 0.8; // Mock implementation
  }
}

export default SubscriptionTiersService;