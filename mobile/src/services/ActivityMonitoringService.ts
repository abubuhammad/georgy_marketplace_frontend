export interface SuspiciousActivity {
  id: string;
  userId: string;
  userType: 'customer' | 'artisan' | 'seller' | 'admin';
  type: 'payment_fraud' | 'fake_reviews' | 'profile_manipulation' | 'spam' | 'harassment' | 'off_platform_dealing' | 'price_manipulation' | 'fake_jobs' | 'identity_theft' | 'bot_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  
  // Activity details
  description: string;
  evidence: ActivityEvidence[];
  patterns: DetectedPattern[];
  
  // Context
  relatedEntities: {
    jobs?: string[];
    transactions?: string[];
    reviews?: string[];
    messages?: string[];
    profiles?: string[];
  };
  
  // Risk assessment
  riskScore: number; // 0-100
  confidenceLevel: number; // 0-100
  potentialImpact: 'low' | 'medium' | 'high' | 'critical';
  
  // Investigation
  investigatedBy?: string;
  investigationNotes?: string;
  resolution?: ActivityResolution;
  
  // System tracking
  detectedAt: string;
  lastUpdated: string;
  resolvedAt?: string;
  metadata: {
    detectionMethod: 'rule_based' | 'ml_model' | 'user_report' | 'manual_review';
    sourceSystem: string;
    ipAddress?: string;
    deviceInfo?: string;
    geolocation?: { lat: number; lng: number; country: string };
    sessionId?: string;
  };
}

export interface ActivityEvidence {
  id: string;
  type: 'transaction_pattern' | 'behavior_anomaly' | 'content_analysis' | 'device_fingerprint' | 'network_analysis' | 'user_report';
  description: string;
  data: any;
  confidence: number;
  timestamp: string;
}

export interface DetectedPattern {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  occurrences: number;
  timeWindow: string;
  threshold: number;
  actualValue: number;
}

export interface ActivityResolution {
  id: string;
  action: 'no_action' | 'warning' | 'temporary_suspension' | 'permanent_ban' | 'account_limitation' | 'manual_review_required';
  reasoning: string;
  appliedBy: string;
  appliedAt: string;
  duration?: number; // days for temporary actions
  restrictions?: {
    noPayments?: boolean;
    noMessaging?: boolean;
    noJobPosting?: boolean;
    noReviews?: boolean;
    limitedVisibility?: boolean;
  };
  appealable: boolean;
  notificationSent: boolean;
}

export interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  type: SuspiciousActivity['type'];
  enabled: boolean;
  severity: SuspiciousActivity['severity'];
  
  // Trigger conditions
  conditions: {
    timeWindow: number; // minutes
    threshold: number;
    metrics: string[];
    operators: ('>' | '<' | '=' | 'contains' | 'pattern')[];
  };
  
  // Actions
  autoActions: {
    immediate?: ActivityResolution['action'];
    requiresReview?: boolean;
    notifyAdmin?: boolean;
    escalateAfter?: number; // minutes
  };
  
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface UserBehaviorProfile {
  userId: string;
  profileCreatedAt: string;
  lastUpdated: string;
  
  // Behavioral metrics
  averageJobAmount: number;
  typicalResponseTime: number;
  usuallWorkingHours: { start: number; end: number };
  commonLocations: { lat: number; lng: number; frequency: number }[];
  paymentPatterns: {
    preferredMethods: string[];
    averageAmount: number;
    frequency: number;
  };
  
  // Risk indicators
  riskFactors: {
    multipleAccounts: boolean;
    suspiciousPaymentActivity: boolean;
    unusualLocationPatterns: boolean;
    highCancellationRate: boolean;
    negativeReviewPattern: boolean;
  };
  
  // Trust indicators
  trustScore: number; // 0-100
  verificationLevel: 'unverified' | 'basic' | 'enhanced' | 'premium';
  positiveInteractions: number;
  successfulTransactions: number;
  communityStanding: 'new' | 'good' | 'excellent' | 'flagged' | 'restricted';
}

export interface MonitoringAlert {
  id: string;
  type: 'rule_triggered' | 'manual_flag' | 'system_anomaly' | 'user_report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  
  // Context
  userId?: string;
  relatedActivity?: string;
  evidence: string[];
  
  // Status
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  
  // Actions taken
  actionsRequired: string[];
  actionsTaken: {
    action: string;
    takenBy: string;
    takenAt: string;
    notes?: string;
  }[];
}

export interface MonitoringDashboard {
  period: string;
  totalActivitiesMonitored: number;
  suspiciousActivitiesDetected: number;
  confirmedViolations: number;
  falsePositives: number;
  actionsApplied: {
    warnings: number;
    suspensions: number;
    bans: number;
    limitations: number;
  };
  
  // Trends
  trends: {
    activityVolume: number[];
    detectionRate: number[];
    resolutionTime: number[];
  };
  
  // Top issues
  topViolationTypes: { type: string; count: number }[];
  topRiskUsers: { userId: string; riskScore: number }[];
  
  // System performance
  systemMetrics: {
    falsePositiveRate: number;
    detectionAccuracy: number;
    averageResolutionTime: number;
    userAppealRate: number;
  };
}

export class ActivityMonitoringService {
  private monitoringRules: MonitoringRule[] = [];
  private userProfiles = new Map<string, UserBehaviorProfile>();
  
  constructor() {
    this.initializeRules();
    this.startMonitoring();
  }

  private initializeRules() {
    this.monitoringRules = [
      {
        id: 'rapid_account_creation',
        name: 'Rapid Account Creation',
        description: 'Multiple accounts created from same IP/device in short time',
        type: 'fake_jobs',
        enabled: true,
        severity: 'high',
        conditions: {
          timeWindow: 60,
          threshold: 3,
          metrics: ['account_creation_count'],
          operators: ['>'],
        },
        autoActions: {
          immediate: 'manual_review_required',
          requiresReview: true,
          notifyAdmin: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        triggerCount: 0,
      },
      {
        id: 'payment_avoidance_pattern',
        name: 'Payment Avoidance Pattern',
        description: 'User attempting to move transactions off-platform',
        type: 'off_platform_dealing',
        enabled: true,
        severity: 'critical',
        conditions: {
          timeWindow: 1440,
          threshold: 2,
          metrics: ['off_platform_keywords', 'contact_sharing'],
          operators: ['contains', '>'],
        },
        autoActions: {
          immediate: 'temporary_suspension',
          requiresReview: true,
          notifyAdmin: true,
          escalateAfter: 30,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        triggerCount: 0,
      },
      {
        id: 'fake_review_pattern',
        name: 'Fake Review Detection',
        description: 'Suspicious review patterns indicating manipulation',
        type: 'fake_reviews',
        enabled: true,
        severity: 'medium',
        conditions: {
          timeWindow: 1440,
          threshold: 5,
          metrics: ['review_velocity', 'review_similarity'],
          operators: ['>', '>'],
        },
        autoActions: {
          immediate: 'warning',
          requiresReview: true,
          notifyAdmin: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        triggerCount: 0,
      },
      {
        id: 'bot_activity_detection',
        name: 'Bot Activity Detection',
        description: 'Automated behavior patterns indicating bot usage',
        type: 'bot_activity',
        enabled: true,
        severity: 'high',
        conditions: {
          timeWindow: 60,
          threshold: 10,
          metrics: ['action_frequency', 'response_time_consistency'],
          operators: ['>', '<'],
        },
        autoActions: {
          immediate: 'account_limitation',
          requiresReview: true,
          notifyAdmin: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        triggerCount: 0,
      },
    ];
  }

  async recordActivity(userId: string, activity: {
    type: string;
    data: any;
    timestamp?: string;
    metadata?: any;
  }): Promise<void> {
    const timestamp = activity.timestamp || new Date().toISOString();
    
    // Update user behavior profile
    await this.updateUserProfile(userId, activity);
    
    // Check against monitoring rules
    await this.checkMonitoringRules(userId, activity);
    
    // Store activity for future analysis
    await this.storeActivity(userId, { ...activity, timestamp });
  }

  private async checkMonitoringRules(userId: string, activity: any): Promise<void> {
    for (const rule of this.monitoringRules.filter(r => r.enabled)) {
      const shouldTrigger = await this.evaluateRule(rule, userId, activity);
      
      if (shouldTrigger.triggered) {
        await this.triggerRule(rule, userId, shouldTrigger.evidence);
      }
    }
  }

  private async evaluateRule(rule: MonitoringRule, userId: string, activity: any): Promise<{
    triggered: boolean;
    evidence: ActivityEvidence[];
  }> {
    const evidence: ActivityEvidence[] = [];
    
    // Get user's recent activities within time window
    const timeWindowStart = new Date(Date.now() - rule.conditions.timeWindow * 60 * 1000);
    const recentActivities = await this.getUserActivities(userId, timeWindowStart);
    
    // Evaluate each condition
    let conditionsMet = 0;
    
    for (let i = 0; i < rule.conditions.metrics.length; i++) {
      const metric = rule.conditions.metrics[i];
      const operator = rule.conditions.operators[i];
      const threshold = rule.conditions.threshold;
      
      const metricValue = await this.calculateMetric(metric, userId, recentActivities, activity);
      const conditionMet = this.evaluateCondition(metricValue, operator, threshold);
      
      if (conditionMet) {
        conditionsMet++;
        evidence.push({
          id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'behavior_anomaly',
          description: `${metric}: ${metricValue} ${operator} ${threshold}`,
          data: { metric, value: metricValue, threshold, operator },
          confidence: 0.8,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    return {
      triggered: conditionsMet >= rule.conditions.metrics.length,
      evidence,
    };
  }

  private async triggerRule(rule: MonitoringRule, userId: string, evidence: ActivityEvidence[]): Promise<void> {
    // Create suspicious activity record
    const suspiciousActivity: SuspiciousActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userType: await this.getUserType(userId),
      type: rule.type,
      severity: rule.severity,
      status: 'detected',
      description: rule.description,
      evidence,
      patterns: [],
      relatedEntities: {},
      riskScore: this.calculateRiskScore(rule.severity, evidence),
      confidenceLevel: this.calculateConfidence(evidence),
      potentialImpact: this.assessPotentialImpact(rule.type, rule.severity),
      detectedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        detectionMethod: 'rule_based',
        sourceSystem: 'activity_monitoring',
      },
    };

    // Save suspicious activity
    await this.saveSuspiciousActivity(suspiciousActivity);

    // Apply immediate actions
    if (rule.autoActions.immediate) {
      await this.applyAutomaticAction(suspiciousActivity, rule.autoActions.immediate);
    }

    // Create monitoring alert
    if (rule.autoActions.notifyAdmin) {
      await this.createMonitoringAlert(suspiciousActivity, rule);
    }

    // Update rule trigger count
    rule.triggerCount++;
    rule.lastTriggered = new Date().toISOString();
    await this.updateRule(rule);
  }

  async investigateActivity(activityId: string, investigatorId: string, notes?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const activity = await this.getSuspiciousActivity(activityId);
      if (!activity) {
        return { success: false, error: 'Activity not found' };
      }

      // Update investigation status
      await this.updateSuspiciousActivity(activityId, {
        status: 'investigating',
        investigatedBy: investigatorId,
        investigationNotes: notes,
        lastUpdated: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start investigation'
      };
    }
  }

  async resolveActivity(
    activityId: string,
    resolution: Omit<ActivityResolution, 'id' | 'appliedAt'>,
    resolvedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const activity = await this.getSuspiciousActivity(activityId);
      if (!activity) {
        return { success: false, error: 'Activity not found' };
      }

      const resolutionRecord: ActivityResolution = {
        ...resolution,
        id: `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        appliedBy: resolvedBy,
        appliedAt: new Date().toISOString(),
      };

      // Apply the resolution action
      await this.executeResolutionAction(activity.userId, resolutionRecord);

      // Update activity status
      await this.updateSuspiciousActivity(activityId, {
        status: resolution.action === 'no_action' ? 'false_positive' : 'resolved',
        resolution: resolutionRecord,
        resolvedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      // Send notification to user if applicable
      if (resolutionRecord.notificationSent) {
        await this.sendResolutionNotification(activity.userId, resolutionRecord);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve activity'
      };
    }
  }

  async getUserRiskProfile(userId: string): Promise<{
    riskScore: number;
    riskFactors: string[];
    recentActivities: SuspiciousActivity[];
    behaviorProfile: UserBehaviorProfile | null;
  }> {
    const behaviorProfile = this.userProfiles.get(userId) || await this.loadUserProfile(userId);
    const recentActivities = await this.getUserSuspiciousActivities(userId, 30); // Last 30 days
    
    const riskScore = behaviorProfile?.trustScore ? 100 - behaviorProfile.trustScore : 50;
    const riskFactors = this.identifyRiskFactors(behaviorProfile, recentActivities);

    return {
      riskScore,
      riskFactors,
      recentActivities,
      behaviorProfile,
    };
  }

  async getMonitoringDashboard(period: string): Promise<MonitoringDashboard> {
    // TODO: Implement dashboard data aggregation
    return {
      period,
      totalActivitiesMonitored: 0,
      suspiciousActivitiesDetected: 0,
      confirmedViolations: 0,
      falsePositives: 0,
      actionsApplied: {
        warnings: 0,
        suspensions: 0,
        bans: 0,
        limitations: 0,
      },
      trends: {
        activityVolume: [],
        detectionRate: [],
        resolutionTime: [],
      },
      topViolationTypes: [],
      topRiskUsers: [],
      systemMetrics: {
        falsePositiveRate: 0,
        detectionAccuracy: 0,
        averageResolutionTime: 0,
        userAppealRate: 0,
      },
    };
  }

  private startMonitoring(): void {
    // Start periodic monitoring processes
    setInterval(() => {
      this.processScheduledChecks();
    }, 60000); // Every minute

    setInterval(() => {
      this.updateUserProfiles();
    }, 300000); // Every 5 minutes

    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Every hour
  }

  // Helper methods
  private calculateRiskScore(severity: string, evidence: ActivityEvidence[]): number {
    const severityScores = { low: 25, medium: 50, high: 75, critical: 90 };
    const baseScore = severityScores[severity as keyof typeof severityScores] || 50;
    const evidenceBonus = Math.min(evidence.length * 5, 25);
    return Math.min(baseScore + evidenceBonus, 100);
  }

  private calculateConfidence(evidence: ActivityEvidence[]): number {
    if (evidence.length === 0) return 0;
    const averageConfidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length;
    return Math.round(averageConfidence * 100);
  }

  private assessPotentialImpact(type: string, severity: string): 'low' | 'medium' | 'high' | 'critical' {
    const highImpactTypes = ['payment_fraud', 'identity_theft', 'off_platform_dealing'];
    
    if (highImpactTypes.includes(type) || severity === 'critical') {
      return 'critical';
    }
    if (severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  }

  private identifyRiskFactors(profile: UserBehaviorProfile | null, activities: SuspiciousActivity[]): string[] {
    const factors: string[] = [];
    
    if (!profile) return ['No behavior profile available'];
    
    if (profile.riskFactors.multipleAccounts) factors.push('Multiple accounts detected');
    if (profile.riskFactors.suspiciousPaymentActivity) factors.push('Suspicious payment patterns');
    if (profile.riskFactors.unusualLocationPatterns) factors.push('Unusual location patterns');
    if (profile.riskFactors.highCancellationRate) factors.push('High cancellation rate');
    if (profile.riskFactors.negativeReviewPattern) factors.push('Pattern of negative reviews');
    
    const recentViolations = activities.filter(a => a.status === 'confirmed').length;
    if (recentViolations > 0) factors.push(`${recentViolations} recent violations`);
    
    return factors;
  }

  // Data access methods (to be implemented)
  private async updateUserProfile(userId: string, activity: any): Promise<void> {
    console.log('Updating user profile:', userId);
  }

  private async storeActivity(userId: string, activity: any): Promise<void> {
    console.log('Storing activity:', userId, activity.type);
  }

  private async getUserActivities(userId: string, since: Date): Promise<any[]> {
    console.log('Fetching user activities:', userId, since);
    return [];
  }

  private async calculateMetric(metric: string, userId: string, activities: any[], currentActivity: any): Promise<number> {
    console.log('Calculating metric:', metric, userId);
    return 0;
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '=': return value === threshold;
      default: return false;
    }
  }

  private async getUserType(userId: string): Promise<'customer' | 'artisan' | 'seller' | 'admin'> {
    console.log('Getting user type:', userId);
    return 'customer';
  }

  private async saveSuspiciousActivity(activity: SuspiciousActivity): Promise<void> {
    console.log('Saving suspicious activity:', activity.id);
  }

  private async getSuspiciousActivity(activityId: string): Promise<SuspiciousActivity | null> {
    console.log('Fetching suspicious activity:', activityId);
    return null;
  }

  private async updateSuspiciousActivity(activityId: string, updates: Partial<SuspiciousActivity>): Promise<void> {
    console.log('Updating suspicious activity:', activityId, updates);
  }

  private async getUserSuspiciousActivities(userId: string, days: number): Promise<SuspiciousActivity[]> {
    console.log('Fetching user suspicious activities:', userId, days);
    return [];
  }

  private async loadUserProfile(userId: string): Promise<UserBehaviorProfile | null> {
    console.log('Loading user profile:', userId);
    return null;
  }

  private async applyAutomaticAction(activity: SuspiciousActivity, action: ActivityResolution['action']): Promise<void> {
    console.log('Applying automatic action:', activity.id, action);
  }

  private async createMonitoringAlert(activity: SuspiciousActivity, rule: MonitoringRule): Promise<void> {
    console.log('Creating monitoring alert:', activity.id, rule.name);
  }

  private async updateRule(rule: MonitoringRule): Promise<void> {
    console.log('Updating rule:', rule.id);
  }

  private async executeResolutionAction(userId: string, resolution: ActivityResolution): Promise<void> {
    console.log('Executing resolution action:', userId, resolution.action);
  }

  private async sendResolutionNotification(userId: string, resolution: ActivityResolution): Promise<void> {
    console.log('Sending resolution notification:', userId, resolution.action);
  }

  private async processScheduledChecks(): Promise<void> {
    console.log('Processing scheduled checks');
  }

  private async updateUserProfiles(): Promise<void> {
    console.log('Updating user profiles');
  }

  private async cleanupOldData(): Promise<void> {
    console.log('Cleaning up old data');
  }
}

export default ActivityMonitoringService;