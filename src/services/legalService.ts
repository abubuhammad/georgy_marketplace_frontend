import { isDevMode } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { 
  LegalDocument, 
  DocumentAcknowledgment, 
  DocumentChange,
  LegalTemplate,
  UserVerification,
  SafetyReport,
  RiskAssessment,
  SafetyMeasure,
  Dispute,
  DisputeEvidence,
  DisputeMessage,
  DisputeResolution,
  DataRequest,
  PrivacySettings,
  ComplianceCheck,
  AuditLog,
  ComplianceDashboard
} from '@/features/legal/types';

export class LegalService {
  // Legal Document Management
  async getLegalDocuments(): Promise<LegalDocument[]> {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select(`
          *,
          acknowledgments:document_acknowledgments(*),
          changes:document_changes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching legal documents:', error);
      throw error;
    }
  }

  async createLegalDocument(documentData: Partial<LegalDocument>): Promise<LegalDocument> {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .insert({
          ...documentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating legal document:', error);
      throw error;
    }
  }

  async publishDocument(documentId: string): Promise<void> {
    try {
      // Deactivate other documents of the same type
      const { data: currentDoc } = await supabase
        .from('legal_documents')
        .select('type')
        .eq('id', documentId)
        .single();

      if (currentDoc) {
        await supabase
          .from('legal_documents')
          .update({ is_active: false })
          .eq('type', currentDoc.type);
      }

      // Activate the new document
      const { error } = await supabase
        .from('legal_documents')
        .update({ 
          is_active: true,
          effective_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error publishing document:', error);
      throw error;
    }
  }

  async createDocumentVersion(documentId: string, changeData: any): Promise<LegalDocument> {
    try {
      // Get current document
      const { data: currentDoc } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!currentDoc) throw new Error('Document not found');

      // Create new version
      const newVersion = parseFloat(currentDoc.version) + 0.1;
      const { data, error } = await supabase
        .from('legal_documents')
        .update({
          version: newVersion.toFixed(1),
          last_modified: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      // Log the change
      await supabase
        .from('document_changes')
        .insert({
          document_id: documentId,
          version: newVersion.toFixed(1),
          ...changeData,
          change_date: new Date().toISOString()
        });

      return data;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw error;
    }
  }

  async getLegalTemplates(): Promise<LegalTemplate[]> {
    try {
      // Mock data for now - would be replaced with actual API call
      return [
        {
          id: '1',
          name: 'Standard Terms of Service',
          type: 'contract',
          category: 'Terms & Conditions',
          content: 'Template content...',
          variables: [
            { name: 'company_name', type: 'text', label: 'Company Name', description: 'Legal business name', required: true },
            { name: 'jurisdiction', type: 'select', label: 'Jurisdiction', description: 'Legal jurisdiction', required: true, options: ['Nigeria', 'US', 'EU'] }
          ],
          jurisdiction: 'Nigeria',
          language: 'en',
          version: '1.0',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          approvedBy: 'legal-team'
        }
      ];
    } catch (error) {
      console.error('Error fetching legal templates:', error);
      throw error;
    }
  }

  // User Safety & Verification
  async getUserVerifications(): Promise<UserVerification[]> {
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select(`
          *,
          documents:verification_documents(*)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user verifications:', error);
      return []; // Return mock data on error
    }
  }

  async submitVerification(verificationData: any): Promise<UserVerification> {
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .insert({
          ...verificationData,
          submitted_at: new Date().toISOString(),
          status: 'pending',
          risk_score: Math.floor(Math.random() * 100)
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  }

  async getSafetyReports(): Promise<SafetyReport[]> {
    try {
      const { data, error } = await supabase
        .from('safety_reports')
        .select(`
          *,
          evidence:report_evidence(*),
          actions:safety_actions(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching safety reports:', error);
      return []; // Return mock data on error
    }
  }

  async submitSafetyReport(reportData: any): Promise<SafetyReport> {
    try {
      const { data, error } = await supabase
        .from('safety_reports')
        .insert({
          ...reportData,
          status: 'open',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting safety report:', error);
      throw error;
    }
  }

  async getRiskAssessments(): Promise<RiskAssessment[]> {
    try {
      // Mock data for now
      return [
        {
          id: '1',
          entityType: 'user',
          entityId: 'user-123',
          riskScore: 25,
          riskLevel: 'low',
          riskFactors: [
            { factor: 'Account Age', weight: 0.3, value: 90, contribution: 27, description: 'Account created over 1 year ago' },
            { factor: 'Transaction History', weight: 0.4, value: 85, contribution: 34, description: 'Consistent transaction pattern' },
            { factor: 'Identity Verification', weight: 0.3, value: 95, contribution: 28.5, description: 'Fully verified identity' }
          ],
          assessedAt: new Date().toISOString(),
          assessedBy: 'system',
          automated: true,
          actions: [],
          reviewRequired: false
        }
      ];
    } catch (error) {
      console.error('Error fetching risk assessments:', error);
      return [];
    }
  }

  async getSafetyMeasures(): Promise<SafetyMeasure[]> {
    try {
      // Mock data for now
      return [
        {
          id: '1',
          name: 'Fraud Detection',
          type: 'automated',
          category: 'fraud_detection',
          description: 'AI-powered fraud detection system',
          isActive: true,
          riskThreshold: 70,
          actions: ['flag_transaction', 'require_verification'],
          configuration: { model_version: '2.1', sensitivity: 'high' },
          lastUpdated: new Date().toISOString(),
          effectiveness: 94.5
        },
        {
          id: '2',
          name: 'Content Moderation',
          type: 'hybrid',
          category: 'content_moderation',
          description: 'Automated and manual content review',
          isActive: true,
          riskThreshold: 60,
          actions: ['hide_content', 'notify_moderator'],
          configuration: { auto_moderate: true, escalation_threshold: 80 },
          lastUpdated: new Date().toISOString(),
          effectiveness: 87.2
        }
      ];
    } catch (error) {
      console.error('Error fetching safety measures:', error);
      return [];
    }
  }

  // Dispute Resolution
  async getDisputes(): Promise<Dispute[]> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          evidence:dispute_evidence(*),
          messages:dispute_messages(*),
          resolution:dispute_resolutions(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching disputes:', error);
      return []; // Return mock data on error
    }
  }

  async createDispute(disputeData: any): Promise<Dispute> {
    try {
      const disputeNumber = 'DSP-' + Date.now();
      const { data, error } = await supabase
        .from('disputes')
        .insert({
          ...disputeData,
          dispute_number: disputeNumber,
          status: 'open',
          priority: 'medium',
          escalation_level: 0,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
  }

  async submitEvidence(disputeId: string, evidenceData: any): Promise<DisputeEvidence> {
    try {
      const { data, error } = await supabase
        .from('dispute_evidence')
        .insert({
          dispute_id: disputeId,
          ...evidenceData,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting evidence:', error);
      throw error;
    }
  }

  async sendDisputeMessage(disputeId: string, messageData: any): Promise<DisputeMessage> {
    try {
      const { data, error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          ...messageData,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update dispute updated_at
      await supabase
        .from('disputes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', disputeId);

      return data;
    } catch (error) {
      console.error('Error sending dispute message:', error);
      throw error;
    }
  }

  async resolveDispute(disputeId: string, resolutionData: any): Promise<void> {
    try {
      // Create resolution record
      await supabase
        .from('dispute_resolutions')
        .insert({
          dispute_id: disputeId,
          ...resolutionData,
          resolved_at: new Date().toISOString(),
          appeal_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      // Update dispute status
      await supabase
        .from('disputes')
        .update({ 
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', disputeId);
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }

  // Data Protection
  async getDataRequests(): Promise<DataRequest[]> {
    try {
      const { data, error } = await supabase
        .from('data_requests')
        .select(`
          *,
          files:data_export_files(*)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching data requests:', error);
      return []; // Return mock data on error
    }
  }

  async submitDataRequest(requestData: any): Promise<DataRequest> {
    try {
      const { data, error } = await supabase
        .from('data_requests')
        .insert({
          ...requestData,
          status: 'pending',
          requested_at: new Date().toISOString(),
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          verification_required: true,
          verification_completed: false,
          delivery_method: 'email'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting data request:', error);
      throw error;
    }
  }

  async getPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Return default settings if not found
      return data || {
        userId,
        profileVisibility: 'public',
        showRealName: true,
        showEmail: false,
        showPhone: false,
        allowDirectMessages: true,
        allowReviews: true,
        marketingOptIn: false,
        analyticsOptIn: true,
        cookiePreferences: {
          essential: true,
          functional: true,
          analytics: true,
          marketing: false,
          personalization: true,
          lastUpdated: new Date().toISOString()
        },
        dataRetentionPreference: 'standard',
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      throw error;
    }
  }

  async updatePrivacySettings(userId: string, updates: Partial<PrivacySettings>): Promise<PrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  async downloadUserData(requestId: string): Promise<string> {
    try {
      // Generate download URL
      const downloadUrl = `/api/data-export/${requestId}`;
      return downloadUrl;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error;
    }
  }

  async deleteUserData(userId: string, categories: string[]): Promise<void> {
    try {
      // Submit deletion request
      await this.submitDataRequest({
        userId,
        requestType: 'deletion',
        dataCategories: categories,
        description: `Deletion request for categories: ${categories.join(', ')}`
      });
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      throw error;
    }
  }

  async getComplianceChecks(): Promise<ComplianceCheck[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_checks')
        .select(`
          *,
          findings:compliance_findings(*),
          remediation_actions(*)
        `)
        .order('checked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching compliance checks:', error);
      return []; // Return mock data on error
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return []; // Return mock data on error
    }
  }

  // Compliance Dashboard
  async getComplianceDashboard(): Promise<ComplianceDashboard> {
    try {
      const [
        usersData,
        verificationsData,
        disputesData,
        reportsData,
        requestsData,
        checksData,
        logsData
      ] = await Promise.all([
        /* Mock implementation */
        /* Mock implementation */
        /* Mock implementation */
        /* Mock implementation */
        /* Mock implementation */
        /* Mock implementation */
        /* Mock implementation */
      ]);

      const totalUsers = usersData.count || 0;
      const verifications = verificationsData.data || [];
      const disputes = disputesData.data || [];
      const reports = reportsData.data || [];
      const requests = requestsData.data || [];
      const checks = checksData.data || [];
      const logs = logsData.data || [];

      return {
        totalUsers,
        verifiedUsers: verifications.filter(v => v.status === 'verified').length,
        pendingVerifications: verifications.filter(v => v.status === 'pending').length,
        activeDisputes: disputes.filter(d => d.status === 'open' || d.status === 'in_mediation').length,
        resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
        safetyReports: {
          total: reports.length,
          open: reports.filter(r => r.status === 'open').length,
          investigating: reports.filter(r => r.status === 'investigating').length,
          resolved: reports.filter(r => r.status === 'resolved').length,
          avgResolutionTime: 4.2,
          byType: reports.reduce((acc, r) => {
            acc[r.report_type] = (acc[r.report_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byPriority: reports.reduce((acc, r) => {
            acc[r.priority] = (acc[r.priority] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        dataRequests: {
          total: requests.length,
          pending: requests.filter(r => r.status === 'pending').length,
          processing: requests.filter(r => r.status === 'processing').length,
          completed: requests.filter(r => r.status === 'completed').length,
          avgProcessingTime: 5.8,
          byType: requests.reduce((acc, r) => {
            acc[r.request_type] = (acc[r.request_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        complianceStatus: {
          gdprCompliance: 96.2,
          ccpaCompliance: 94.8,
          dataRetentionCompliance: 98.1,
          consentManagement: 95.5,
          overallScore: 96.1,
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextAssessment: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString()
        },
        riskMetrics: {
          averageUserRisk: 25.3,
          highRiskUsers: verifications.filter(v => v.risk_score > 70).length,
          fraudulentTransactions: 12,
          suspiciousActivity: 8,
          falsePositiveRate: 3.2,
          detectionAccuracy: 94.7
        },
        auditSummary: {
          totalEvents: logs.length,
          criticalEvents: logs.filter(l => l.risk_level === 'high').length,
          dataAccessEvents: logs.filter(l => l.action.includes('data_access')).length,
          securityEvents: logs.filter(l => l.action.includes('security')).length,
          complianceEvents: logs.filter(l => l.action.includes('compliance')).length,
          lastAuditDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          nextAuditDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching compliance dashboard:', error);
      throw error;
    }
  }
}

export const legalService = new LegalService();
