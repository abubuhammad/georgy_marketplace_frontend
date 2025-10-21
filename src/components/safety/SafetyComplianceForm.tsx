import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  User, 
  FileText, 
  CheckCircle, 
  Clock,
  MapPin,
  Camera,
  Upload,
  Download,
  Info,
  UserCheck,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

interface IdentityVerification {
  documentType: 'nin' | 'passport' | 'drivers_license' | 'voters_card';
  documentNumber: string;
  documentImage?: string;
  selfieImage?: string;
  verified: boolean;
  verifiedAt?: string;
}

interface RiskAssessment {
  activityType: string;
  riskLevel: 'low' | 'medium' | 'high';
  safetyMeasures: string[];
  insuranceCoverage: boolean;
  emergencyProcedures: string;
  specialRequirements?: string;
}

interface LiabilityWaiver {
  agreesToTerms: boolean;
  acknowledgesRisks: boolean;
  releasesLiability: boolean;
  signatureData?: string;
  signedAt?: string;
  witnessName?: string;
  witnessSignature?: string;
}

interface SafetyCompliance {
  id: string;
  userId: string;
  emergencyContacts: EmergencyContact[];
  identityVerification: IdentityVerification;
  riskAssessment: RiskAssessment;
  liabilityWaiver: LiabilityWaiver;
  medicalInfo?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    bloodType?: string;
    insuranceProvider?: string;
    policyNumber?: string;
  };
  completedAt?: string;
  status: 'incomplete' | 'pending_review' | 'approved' | 'rejected';
}

interface SafetyComplianceFormProps {
  compliance?: SafetyCompliance;
  activityType: string;
  onSubmit: (compliance: SafetyCompliance) => void;
  onSave: (compliance: Partial<SafetyCompliance>) => void;
  className?: string;
}

const DOCUMENT_TYPES = [
  { value: 'nin', label: 'National Identity Number (NIN)' },
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'voters_card', label: "Voter's Card" }
];

const RELATIONSHIPS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 
  'Colleague', 'Neighbor', 'Other Family Member', 'Guardian'
];

const ACTIVITY_TYPES = [
  'Real Estate Viewing',
  'Service Appointment',
  'Product Pickup',
  'Job Interview',
  'Business Meeting',
  'Artisan Service',
  'Delivery Service',
  'Other'
];

const SAFETY_MEASURES = [
  'Use protective equipment',
  'Follow safety protocols',
  'Maintain physical distancing',
  'Wear identification badge',
  'Share location with contacts',
  'Carry emergency communication device',
  'Follow scheduled check-ins',
  'Use verified transportation'
];

export function SafetyComplianceForm({
  compliance,
  activityType,
  onSubmit,
  onSave,
  className
}: SafetyComplianceFormProps) {
  const [currentCompliance, setCurrentCompliance] = useState<SafetyCompliance>(
    compliance || {
      id: `safety-${Date.now()}`,
      userId: '',
      emergencyContacts: [
        { name: '', relationship: '', phone: '', isPrimary: true }
      ],
      identityVerification: {
        documentType: 'nin',
        documentNumber: '',
        verified: false
      },
      riskAssessment: {
        activityType,
        riskLevel: 'low',
        safetyMeasures: [],
        insuranceCoverage: false,
        emergencyProcedures: ''
      },
      liabilityWaiver: {
        agreesToTerms: false,
        acknowledgesRisks: false,
        releasesLiability: false
      },
      status: 'incomplete'
    }
  );

  const [activeTab, setActiveTab] = useState('emergency');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCompliance = (updates: Partial<SafetyCompliance>) => {
    const updated = { ...currentCompliance, ...updates };
    setCurrentCompliance(updated);
    onSave(updated);
  };

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      name: '',
      relationship: '',
      phone: '',
      isPrimary: false
    };
    
    updateCompliance({
      emergencyContacts: [...currentCompliance.emergencyContacts, newContact]
    });
  };

  const updateEmergencyContact = (index: number, updates: Partial<EmergencyContact>) => {
    const contacts = [...currentCompliance.emergencyContacts];
    contacts[index] = { ...contacts[index], ...updates };
    
    // Ensure only one primary contact
    if (updates.isPrimary) {
      contacts.forEach((contact, i) => {
        if (i !== index) contact.isPrimary = false;
      });
    }
    
    updateCompliance({ emergencyContacts: contacts });
  };

  const removeEmergencyContact = (index: number) => {
    if (currentCompliance.emergencyContacts.length <= 1) return;
    
    const contacts = currentCompliance.emergencyContacts.filter((_, i) => i !== index);
    updateCompliance({ emergencyContacts: contacts });
  };

  const handleFileUpload = (file: File, type: 'document' | 'selfie') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      updateCompliance({
        identityVerification: {
          ...currentCompliance.identityVerification,
          [type === 'document' ? 'documentImage' : 'selfieImage']: imageData
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleSafetyMeasure = (measure: string) => {
    const measures = [...currentCompliance.riskAssessment.safetyMeasures];
    const index = measures.indexOf(measure);
    
    if (index > -1) {
      measures.splice(index, 1);
    } else {
      measures.push(measure);
    }
    
    updateCompliance({
      riskAssessment: {
        ...currentCompliance.riskAssessment,
        safetyMeasures: measures
      }
    });
  };

  const isFormComplete = () => {
    const { emergencyContacts, identityVerification, riskAssessment, liabilityWaiver } = currentCompliance;
    
    return (
      emergencyContacts.some(c => c.name && c.phone && c.relationship) &&
      identityVerification.documentNumber &&
      identityVerification.documentImage &&
      identityVerification.selfieImage &&
      riskAssessment.emergencyProcedures &&
      liabilityWaiver.agreesToTerms &&
      liabilityWaiver.acknowledgesRisks &&
      liabilityWaiver.releasesLiability
    );
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) return;
    
    setIsSubmitting(true);
    
    try {
      const completed: SafetyCompliance = {
        ...currentCompliance,
        completedAt: new Date().toISOString(),
        status: 'pending_review'
      };
      
      onSubmit(completed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 5;
    
    if (currentCompliance.emergencyContacts.some(c => c.name && c.phone)) completed++;
    if (currentCompliance.identityVerification.documentNumber) completed++;
    if (currentCompliance.identityVerification.documentImage && currentCompliance.identityVerification.selfieImage) completed++;
    if (currentCompliance.riskAssessment.emergencyProcedures) completed++;
    if (currentCompliance.liabilityWaiver.agreesToTerms) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Safety & Compliance Form
              </CardTitle>
              <p className="text-gray-500 mt-1">
                Complete safety requirements for: {activityType}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {getCompletionPercentage()}%
              </div>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="identity" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Identity
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk
              </TabsTrigger>
              <TabsTrigger value="liability" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Liability
              </TabsTrigger>
            </TabsList>

            {/* Emergency Contacts */}
            <TabsContent value="emergency" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Emergency Contacts</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Provide at least one emergency contact who can be reached in case of an emergency.
                </p>

                {currentCompliance.emergencyContacts.map((contact, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Contact {index + 1}
                          {contact.isPrimary && (
                            <Badge variant="destructive" className="ml-2">Primary</Badge>
                          )}
                        </CardTitle>
                        {currentCompliance.emergencyContacts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmergencyContact(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={contact.name}
                            onChange={(e) => updateEmergencyContact(index, { name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <Label>Relationship *</Label>
                          <Select
                            value={contact.relationship}
                            onValueChange={(value) => updateEmergencyContact(index, { relationship: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {RELATIONSHIPS.map(rel => (
                                <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Phone Number *</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateEmergencyContact(index, { phone: e.target.value })}
                            placeholder="e.g., +234 801 234 5678"
                          />
                        </div>
                        <div>
                          <Label>Email (Optional)</Label>
                          <Input
                            value={contact.email || ''}
                            onChange={(e) => updateEmergencyContact(index, { email: e.target.value })}
                            placeholder="email@example.com"
                            type="email"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Address (Optional)</Label>
                        <Textarea
                          value={contact.address || ''}
                          onChange={(e) => updateEmergencyContact(index, { address: e.target.value })}
                          placeholder="Physical address"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={contact.isPrimary}
                          onCheckedChange={(checked) => updateEmergencyContact(index, { isPrimary: !!checked })}
                        />
                        <Label>Primary emergency contact</Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={addEmergencyContact}
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Add Another Contact
                </Button>
              </div>
            </TabsContent>

            {/* Identity Verification */}
            <TabsContent value="identity" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Identity Verification</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Upload a valid government-issued ID and take a selfie for verification.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Document Type *</Label>
                    <Select
                      value={currentCompliance.identityVerification.documentType}
                      onValueChange={(value: any) => updateCompliance({
                        identityVerification: {
                          ...currentCompliance.identityVerification,
                          documentType: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(doc => (
                          <SelectItem key={doc.value} value={doc.value}>
                            {doc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Document Number *</Label>
                    <Input
                      value={currentCompliance.identityVerification.documentNumber}
                      onChange={(e) => updateCompliance({
                        identityVerification: {
                          ...currentCompliance.identityVerification,
                          documentNumber: e.target.value
                        }
                      })}
                      placeholder="Enter document number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Document Photo *</CardTitle>
                      <p className="text-sm text-gray-600">
                        Take a clear photo of your ID document
                      </p>
                    </CardHeader>
                    <CardContent>
                      {currentCompliance.identityVerification.documentImage ? (
                        <div className="space-y-3">
                          <img
                            src={currentCompliance.identityVerification.documentImage}
                            alt="Document"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('document-upload')?.click()}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Retake Photo
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                          onClick={() => document.getElementById('document-upload')?.click()}
                        >
                          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload document photo</p>
                        </div>
                      )}
                      <input
                        id="document-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'document')}
                      />
                    </CardContent>
                  </Card>

                  {/* Selfie Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Selfie Photo *</CardTitle>
                      <p className="text-sm text-gray-600">
                        Take a clear selfie for identity verification
                      </p>
                    </CardHeader>
                    <CardContent>
                      {currentCompliance.identityVerification.selfieImage ? (
                        <div className="space-y-3">
                          <img
                            src={currentCompliance.identityVerification.selfieImage}
                            alt="Selfie"
                            className="w-full h-32 object-cover rounded border"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('selfie-upload')?.click()}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Retake Photo
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                          onClick={() => document.getElementById('selfie-upload')?.click()}
                        >
                          <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Click to take selfie</p>
                        </div>
                      )}
                      <input
                        id="selfie-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                      />
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your identity documents are securely encrypted and used only for verification purposes.
                    They will not be shared with third parties.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Risk Assessment */}
            <TabsContent value="risk" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Help us understand the activity and implement appropriate safety measures.
                </p>

                <div className="space-y-6">
                  <div>
                    <Label>Activity Type</Label>
                    <Select
                      value={currentCompliance.riskAssessment.activityType}
                      onValueChange={(value) => updateCompliance({
                        riskAssessment: {
                          ...currentCompliance.riskAssessment,
                          activityType: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_TYPES.map(activity => (
                          <SelectItem key={activity} value={activity}>{activity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Risk Level Assessment</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {(['low', 'medium', 'high'] as const).map(level => (
                        <button
                          key={level}
                          className={cn(
                            "p-3 border rounded-lg text-center transition-all",
                            currentCompliance.riskAssessment.riskLevel === level
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => updateCompliance({
                            riskAssessment: {
                              ...currentCompliance.riskAssessment,
                              riskLevel: level
                            }
                          })}
                        >
                          <div className={cn(
                            "font-medium capitalize",
                            level === 'low' && "text-green-600",
                            level === 'medium' && "text-yellow-600",
                            level === 'high' && "text-red-600"
                          )}>
                            {level} Risk
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Safety Measures (Select all that apply)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {SAFETY_MEASURES.map(measure => (
                        <div key={measure} className="flex items-center space-x-2">
                          <Checkbox
                            checked={currentCompliance.riskAssessment.safetyMeasures.includes(measure)}
                            onCheckedChange={() => toggleSafetyMeasure(measure)}
                          />
                          <Label className="text-sm">{measure}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={currentCompliance.riskAssessment.insuranceCoverage}
                      onCheckedChange={(checked) => updateCompliance({
                        riskAssessment: {
                          ...currentCompliance.riskAssessment,
                          insuranceCoverage: !!checked
                        }
                      })}
                    />
                    <Label>I have valid insurance coverage for this activity</Label>
                  </div>

                  <div>
                    <Label>Emergency Procedures *</Label>
                    <Textarea
                      value={currentCompliance.riskAssessment.emergencyProcedures}
                      onChange={(e) => updateCompliance({
                        riskAssessment: {
                          ...currentCompliance.riskAssessment,
                          emergencyProcedures: e.target.value
                        }
                      })}
                      placeholder="Describe what you will do in case of an emergency during this activity..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Special Requirements (Optional)</Label>
                    <Textarea
                      value={currentCompliance.riskAssessment.specialRequirements || ''}
                      onChange={(e) => updateCompliance({
                        riskAssessment: {
                          ...currentCompliance.riskAssessment,
                          specialRequirements: e.target.value
                        }
                      })}
                      placeholder="Any special requirements, medical conditions, or accessibility needs..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Liability Waiver */}
            <TabsContent value="liability" className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Liability Waiver & Agreement</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please read and agree to the following terms before proceeding.
                </p>

                <Card className="p-6 bg-gray-50">
                  <h4 className="font-medium mb-3">Liability Waiver Terms</h4>
                  <div className="text-sm space-y-2 text-gray-700 max-h-40 overflow-y-auto">
                    <p>
                      By participating in this activity, I acknowledge that I understand the nature of the activity 
                      and that I am qualified, in good health, and in proper physical condition to participate.
                    </p>
                    <p>
                      I acknowledge that this activity involves risks and dangers which could result in injury, 
                      illness, disability, or death. I voluntarily assume all risk of injury, illness, disability, 
                      or death that may result from participating in this activity.
                    </p>
                    <p>
                      I hereby release, discharge, and hold harmless Georgy Marketplace, its officers, employees, 
                      agents, and representatives from any and all liability, claims, demands, actions, or rights 
                      of action arising out of or related to any loss, damage, or injury that may be sustained 
                      by me or my property while participating in this activity.
                    </p>
                  </div>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={currentCompliance.liabilityWaiver.agreesToTerms}
                      onCheckedChange={(checked) => updateCompliance({
                        liabilityWaiver: {
                          ...currentCompliance.liabilityWaiver,
                          agreesToTerms: !!checked
                        }
                      })}
                    />
                    <Label className="text-sm">
                      I agree to the terms and conditions outlined in the liability waiver above. *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={currentCompliance.liabilityWaiver.acknowledgesRisks}
                      onCheckedChange={(checked) => updateCompliance({
                        liabilityWaiver: {
                          ...currentCompliance.liabilityWaiver,
                          acknowledgesRisks: !!checked
                        }
                      })}
                    />
                    <Label className="text-sm">
                      I acknowledge that I have read, understood, and accept all risks associated with this activity. *
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      checked={currentCompliance.liabilityWaiver.releasesLiability}
                      onCheckedChange={(checked) => updateCompliance({
                        liabilityWaiver: {
                          ...currentCompliance.liabilityWaiver,
                          releasesLiability: !!checked
                        }
                      })}
                    />
                    <Label className="text-sm">
                      I release Georgy Marketplace from any liability for injuries or damages that may occur. *
                    </Label>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This is a legally binding agreement. Please read carefully before agreeing. 
                    If you have questions, consult with a legal advisor before proceeding.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onSave(currentCompliance)}
        >
          Save Progress
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormComplete() || isSubmitting}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit for Review
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default SafetyComplianceForm;
