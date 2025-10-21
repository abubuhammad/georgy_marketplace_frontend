// Legal & Safety Framework Types

// Legal Documents
export interface LegalDocument {
  id: string;
  type: 'terms_of_service' | 'privacy_policy' | 'cookie_policy' | 'refund_policy' | 'seller_agreement' | 'data_processing_agreement';
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastModified: string;
  isActive: boolean;
  language: string;
  jurisdiction: string;
  approvedBy: string;
  signature?: string;
  acknowledgments: DocumentAcknowledgment[];
  changes: DocumentChange[];
}

export interface DocumentAcknowledgment {
  id: string;
  userId: string;
  documentId: string;
  documentVersion: string;
  acknowledgedAt: string;
  ipAddress: string;
  userAgent: string;
  signature?: string;
  witnessId?: string;
}

export interface DocumentChange {
  id: string;
  version: string;
  changedBy: string;
  changeDate: string;
  changeDescription: string;
  impactLevel: 'minor' | 'major' | 'critical';
  notificationSent: boolean;
}

// User Safety & Verification
export interface UserVerification {
  id: string;
  userId: string;
  verificationType: 'identity' | 'phone' | 'email' | 'address' | 'business' | 'bank_account';
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'under_review';
  submittedAt: string;
  verifiedAt?: string;
  expiresAt?: string;
  documents: VerificationDocument[];
  verificationData: Record<string, any>;
  verifiedBy?: string;
  rejectionReason?: string;
  riskScore: number;
  trustLevel: 'low' | 'medium' | 'high' | 'verified';
}

export interface VerificationDocument {
  id: string;
  type: 'passport' | 'driver_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'business_license';
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
  extractedData: Record<string, any>;
  confidence: number;
}

export interface SafetyReport {
  id: string;
  reportedBy: string;
  reportedUser?: string;
  reportedProduct?: string;
  reportedOrder?: string;
  reportType: 'fraud' | 'harassment' | 'inappropriate_content' | 'copyright' | 'trademark' | 'fake_product' | 'spam' | 'other';
  description: string;
  evidence: ReportEvidence[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  actions: SafetyAction[];
}

export interface ReportEvidence {
  id: string;
  type: 'screenshot' | 'document' | 'message' | 'transaction' | 'other';
  fileName: string;
  fileUrl: string;
  description?: string;
  uploadedAt: string;
}

export interface SafetyAction {
  id: string;
  actionType: 'warning' | 'suspension' | 'ban' | 'product_removal' | 'account_restriction' | 'refund' | 'investigation';
  description: string;
  takenBy: string;
  takenAt: string;
  duration?: string;
  appealable: boolean;
  notificationSent: boolean;
}

// Dispute Resolution
export interface Dispute {
  id: string;
  disputeNumber: string;
  orderId?: string;
  buyerId: string;
  sellerId: string;
  disputeType: 'product_not_received' | 'product_not_as_described' | 'refund_request' | 'payment_issue' | 'shipping_damage' | 'other';
  subject: string;
  description: string;
  amount: number;
  currency: string;
  status: 'open' | 'in_mediation' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  deadline: string;
  evidence: DisputeEvidence[];
  messages: DisputeMessage[];
  resolution?: DisputeResolution;
  mediatorId?: string;
  escalationLevel: number;
}

export interface DisputeEvidence {
  id: string;
  submittedBy: string;
  submittedAt: string;
  evidenceType: 'photo' | 'document' | 'tracking_info' | 'communication' | 'receipt' | 'other';
  title: string;
  description: string;
  files: EvidenceFile[];
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface DisputeMessage {
  id: string;
  senderId: string;
  senderType: 'buyer' | 'seller' | 'mediator' | 'system';
  content: string;
  timestamp: string;
  attachments: MessageAttachment[];
  isInternal: boolean;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface DisputeResolution {
  id: string;
  resolvedBy: string;
  resolvedAt: string;
  resolutionType: 'buyer_favor' | 'seller_favor' | 'partial_refund' | 'replacement' | 'mediated_agreement' | 'dismissed';
  outcome: string;
  refundAmount?: number;
  actions: string[];
  appealDeadline: string;
  finalNotificationSent: boolean;
}

// Data Protection & Privacy
export interface DataRequest {
  id: string;
  userId: string;
  requestType: 'access' | 'portability' | 'deletion' | 'rectification' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'partially_completed';
  requestedAt: string;
  completedAt?: string;
  deadline: string;
  description?: string;
  dataCategories: string[];
  processedBy?: string;
  verificationRequired: boolean;
  verificationCompleted: boolean;
  deliveryMethod: 'email' | 'download' | 'postal' | 'secure_portal';
  response?: string;
  files?: DataExportFile[];
}

export interface DataExportFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  expiresAt: string;
  downloadCount: number;
  maxDownloads: number;
}

export interface PrivacySettings {
  userId: string;
  profileVisibility: 'public' | 'limited' | 'private';
  showRealName: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowDirectMessages: boolean;
  allowReviews: boolean;
  marketingOptIn: boolean;
  analyticsOptIn: boolean;
  cookiePreferences: CookiePreferences;
  dataRetentionPreference: 'standard' | 'minimal' | 'extended';
  updatedAt: string;
}

export interface CookiePreferences {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  lastUpdated: string;
}

// Compliance & Audit
export interface ComplianceCheck {
  id: string;
  checkType: 'gdpr' | 'ccpa' | 'coppa' | 'pipeda' | 'lgpd' | 'pdpa' | 'custom';
  entityType: 'user' | 'product' | 'transaction' | 'data_processing';
  entityId: string;
  status: 'compliant' | 'non_compliant' | 'review_required' | 'pending';
  checkedAt: string;
  checkedBy: string;
  findings: ComplianceFinding[];
  remediationActions: RemediationAction[];
  nextCheckDate: string;
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  regulationReference: string;
  evidenceUrl?: string;
}

export interface RemediationAction {
  id: string;
  action: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  riskLevel: 'low' | 'medium' | 'high';
  automated: boolean;
}

// Platform Safety Measures
export interface SafetyMeasure {
  id: string;
  name: string;
  type: 'automated' | 'manual' | 'hybrid';
  category: 'fraud_detection' | 'content_moderation' | 'identity_verification' | 'transaction_monitoring' | 'behavior_analysis';
  description: string;
  isActive: boolean;
  riskThreshold: number;
  actions: string[];
  configuration: Record<string, any>;
  lastUpdated: string;
  effectiveness: number;
}

export interface RiskAssessment {
  id: string;
  entityType: 'user' | 'transaction' | 'product' | 'message';
  entityId: string;
  riskScore: number;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskFactors: RiskFactor[];
  assessedAt: string;
  assessedBy: string;
  automated: boolean;
  actions: string[];
  reviewRequired: boolean;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  value: number;
  contribution: number;
  description: string;
}

// Legal Compliance Dashboard
export interface ComplianceDashboard {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  activeDisputes: number;
  resolvedDisputes: number;
  safetyReports: SafetyReportStats;
  dataRequests: DataRequestStats;
  complianceStatus: ComplianceStatus;
  riskMetrics: RiskMetrics;
  auditSummary: AuditSummary;
}

export interface SafetyReportStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  avgResolutionTime: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface DataRequestStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  avgProcessingTime: number;
  byType: Record<string, number>;
}

export interface ComplianceStatus {
  gdprCompliance: number;
  ccpaCompliance: number;
  dataRetentionCompliance: number;
  consentManagement: number;
  overallScore: number;
  lastAssessment: string;
  nextAssessment: string;
}

export interface RiskMetrics {
  averageUserRisk: number;
  highRiskUsers: number;
  fraudulentTransactions: number;
  suspiciousActivity: number;
  falsePositiveRate: number;
  detectionAccuracy: number;
}

export interface AuditSummary {
  totalEvents: number;
  criticalEvents: number;
  dataAccessEvents: number;
  securityEvents: number;
  complianceEvents: number;
  lastAuditDate: string;
  nextAuditDate: string;
}

// Legal Templates and Forms
export interface LegalTemplate {
  id: string;
  name: string;
  type: 'contract' | 'agreement' | 'notice' | 'policy' | 'disclaimer';
  category: string;
  content: string;
  variables: TemplateVariable[];
  jurisdiction: string;
  language: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  approvedBy: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: string;
}

export interface LegalNotice {
  id: string;
  type: 'policy_update' | 'service_change' | 'security_breach' | 'maintenance' | 'legal_notice';
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  targetAudience: 'all_users' | 'sellers' | 'buyers' | 'specific_users';
  targetUsers?: string[];
  isActive: boolean;
  publishedAt: string;
  expiresAt?: string;
  acknowledgmentRequired: boolean;
  acknowledgments: NoticeAcknowledgment[];
}

export interface NoticeAcknowledgment {
  id: string;
  userId: string;
  noticeId: string;
  acknowledgedAt: string;
  ipAddress: string;
  method: 'click' | 'email' | 'signature';
}
