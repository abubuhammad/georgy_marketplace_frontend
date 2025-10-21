import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  User, Truck, FileText, CheckCircle, Upload, MapPin,
  Phone, Mail, Calendar, Shield, AlertCircle, Star
} from 'lucide-react';

interface OnboardingData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  vehicle: {
    type: 'bike' | 'scooter' | 'car' | 'van';
    make: string;
    model: string;
    year: string;
    licensePlate: string;
    fuelType: 'gasoline' | 'electric' | 'hybrid';
    insurance: {
      provider: string;
      policyNumber: string;
      expiryDate: string;
    };
  };
  documents: {
    driversLicense: File | null;
    vehicleRegistration: File | null;
    insurance: File | null;
    backgroundCheck: File | null;
  };
  preferences: {
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: string[];
    deliveryAreas: string[];
    maxDeliveryDistance: number;
  };
  agreements: {
    termsOfService: boolean;
    privacyPolicy: boolean;
    contractorAgreement: boolean;
  };
}

const steps = [
  { id: 'personal', title: 'Personal Information', icon: User },
  { id: 'vehicle', title: 'Vehicle Details', icon: Truck },
  { id: 'documents', title: 'Documents', icon: FileText },
  { id: 'preferences', title: 'Work Preferences', icon: MapPin },
  { id: 'agreements', title: 'Agreements', icon: Shield },
  { id: 'review', title: 'Review & Submit', icon: CheckCircle }
];

export const DeliveryAgentOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    vehicle: {
      type: 'bike',
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      fuelType: 'gasoline',
      insurance: {
        provider: '',
        policyNumber: '',
        expiryDate: ''
      }
    },
    documents: {
      driversLicense: null,
      vehicleRegistration: null,
      insurance: null,
      backgroundCheck: null
    },
    preferences: {
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      workingDays: [],
      deliveryAreas: [],
      maxDeliveryDistance: 10
    },
    agreements: {
      termsOfService: false,
      privacyPolicy: false,
      contractorAgreement: false
    }
  });

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const handleFileUpload = (field: keyof OnboardingData['documents'], file: File | null) => {
    setData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Personal Information
        const { personalInfo } = data;
        return !!(
          personalInfo.firstName &&
          personalInfo.lastName &&
          personalInfo.email &&
          personalInfo.phone &&
          personalInfo.dateOfBirth &&
          personalInfo.address.street &&
          personalInfo.address.city &&
          personalInfo.emergencyContact.name &&
          personalInfo.emergencyContact.phone
        );
      
      case 1: // Vehicle Details
        const { vehicle } = data;
        return !!(
          vehicle.make &&
          vehicle.model &&
          vehicle.year &&
          vehicle.licensePlate &&
          vehicle.insurance.provider &&
          vehicle.insurance.policyNumber
        );
      
      case 2: // Documents
        const { documents } = data;
        return !!(
          documents.driversLicense &&
          documents.vehicleRegistration &&
          documents.insurance
        );
      
      case 3: // Preferences
        const { preferences } = data;
        return !!(
          preferences.workingDays.length > 0 &&
          preferences.deliveryAreas.length > 0
        );
      
      case 4: // Agreements
        const { agreements } = data;
        return !!(
          agreements.termsOfService &&
          agreements.privacyPolicy &&
          agreements.contractorAgreement
        );
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const submitApplication = async () => {
    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('personalInfo', JSON.stringify(data.personalInfo));
      formData.append('vehicle', JSON.stringify(data.vehicle));
      formData.append('preferences', JSON.stringify(data.preferences));
      formData.append('agreements', JSON.stringify(data.agreements));
      
      // Add files
      if (data.documents.driversLicense) {
        formData.append('driversLicense', data.documents.driversLicense);
      }
      if (data.documents.vehicleRegistration) {
        formData.append('vehicleRegistration', data.documents.vehicleRegistration);
      }
      if (data.documents.insurance) {
        formData.append('insurance', data.documents.insurance);
      }
      if (data.documents.backgroundCheck) {
        formData.append('backgroundCheck', data.documents.backgroundCheck);
      }
      
      const response = await apiClient.post('/api/delivery-agent/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success) {
        toast.success('Application submitted successfully! We\'ll review it within 24-48 hours.');
        navigate('/delivery-agent/status');
      } else {
        toast.error(response.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={data.personalInfo.firstName}
                  onChange={(e) => updateData('personalInfo', { firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={data.personalInfo.lastName}
                  onChange={(e) => updateData('personalInfo', { lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updateData('personalInfo', { email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.personalInfo.phone}
                  onChange={(e) => updateData('personalInfo', { phone: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.personalInfo.dateOfBirth}
                onChange={(e) => updateData('personalInfo', { dateOfBirth: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-4">
              <Label>Address *</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Street Address"
                  value={data.personalInfo.address.street}
                  onChange={(e) => updateData('personalInfo', {
                    address: { ...data.personalInfo.address, street: e.target.value }
                  })}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={data.personalInfo.address.city}
                    onChange={(e) => updateData('personalInfo', {
                      address: { ...data.personalInfo.address, city: e.target.value }
                    })}
                    required
                  />
                  <Input
                    placeholder="State"
                    value={data.personalInfo.address.state}
                    onChange={(e) => updateData('personalInfo', {
                      address: { ...data.personalInfo.address, state: e.target.value }
                    })}
                    required
                  />
                </div>
                <Input
                  placeholder="Postal Code"
                  value={data.personalInfo.address.postalCode}
                  onChange={(e) => updateData('personalInfo', {
                    address: { ...data.personalInfo.address, postalCode: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Emergency Contact *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Contact Name"
                  value={data.personalInfo.emergencyContact.name}
                  onChange={(e) => updateData('personalInfo', {
                    emergencyContact: { ...data.personalInfo.emergencyContact, name: e.target.value }
                  })}
                  required
                />
                <Input
                  placeholder="Contact Phone"
                  value={data.personalInfo.emergencyContact.phone}
                  onChange={(e) => updateData('personalInfo', {
                    emergencyContact: { ...data.personalInfo.emergencyContact, phone: e.target.value }
                  })}
                  required
                />
              </div>
              <Input
                placeholder="Relationship"
                value={data.personalInfo.emergencyContact.relationship}
                onChange={(e) => updateData('personalInfo', {
                  emergencyContact: { ...data.personalInfo.emergencyContact, relationship: e.target.value }
                })}
                required
              />
            </div>
          </div>
        );
      
      case 1: // Vehicle Details
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select
                  value={data.vehicle.type}
                  onValueChange={(value: any) => updateData('vehicle', { type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select
                  value={data.vehicle.fuelType}
                  onValueChange={(value: any) => updateData('vehicle', { fuelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={data.vehicle.make}
                  onChange={(e) => updateData('vehicle', { make: e.target.value })}
                  placeholder="e.g., Toyota, Honda"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={data.vehicle.model}
                  onChange={(e) => updateData('vehicle', { model: e.target.value })}
                  placeholder="e.g., Camry, Civic"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  value={data.vehicle.year}
                  onChange={(e) => updateData('vehicle', { year: e.target.value })}
                  placeholder="e.g., 2020"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate *</Label>
              <Input
                id="licensePlate"
                value={data.vehicle.licensePlate}
                onChange={(e) => updateData('vehicle', { licensePlate: e.target.value })}
                placeholder="e.g., ABC-1234"
                required
              />
            </div>
            
            <div className="space-y-4">
              <Label>Insurance Information *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Insurance Provider"
                  value={data.vehicle.insurance.provider}
                  onChange={(e) => updateData('vehicle', {
                    insurance: { ...data.vehicle.insurance, provider: e.target.value }
                  })}
                  required
                />
                <Input
                  placeholder="Policy Number"
                  value={data.vehicle.insurance.policyNumber}
                  onChange={(e) => updateData('vehicle', {
                    insurance: { ...data.vehicle.insurance, policyNumber: e.target.value }
                  })}
                  required
                />
              </div>
              <Input
                type="date"
                placeholder="Policy Expiry Date"
                value={data.vehicle.insurance.expiryDate}
                onChange={(e) => updateData('vehicle', {
                  insurance: { ...data.vehicle.insurance, expiryDate: e.target.value }
                })}
                required
              />
            </div>
          </div>
        );
      
      case 2: // Documents
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Required Documents</h4>
                  <p className="text-sm text-blue-700">
                    Please upload clear, high-quality images of all required documents. Files should be in PDF, JPEG, or PNG format.
                  </p>
                </div>
              </div>
            </div>
            
            {[
              { key: 'driversLicense', label: "Driver's License", required: true },
              { key: 'vehicleRegistration', label: 'Vehicle Registration', required: true },
              { key: 'insurance', label: 'Insurance Certificate', required: true },
              { key: 'backgroundCheck', label: 'Background Check', required: false }
            ].map((doc) => (
              <div key={doc.key} className="space-y-2">
                <Label>
                  {doc.label} {doc.required && '*'}
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(doc.key as keyof OnboardingData['documents'], e.target.files?.[0] || null)}
                    className="hidden"
                    id={`file-${doc.key}`}
                  />
                  <label htmlFor={`file-${doc.key}`} className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {data.documents[doc.key as keyof OnboardingData['documents']]?.name ||
                        'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPEG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 3: // Preferences
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Working Hours *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={data.preferences.workingHours.start}
                    onChange={(e) => updateData('preferences', {
                      workingHours: { ...data.preferences.workingHours, start: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={data.preferences.workingHours.end}
                    onChange={(e) => updateData('preferences', {
                      workingHours: { ...data.preferences.workingHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Working Days *</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={data.preferences.workingDays.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData('preferences', {
                            workingDays: [...data.preferences.workingDays, day]
                          });
                        } else {
                          updateData('preferences', {
                            workingDays: data.preferences.workingDays.filter(d => d !== day)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={day}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxDistance">Maximum Delivery Distance (km) *</Label>
              <Input
                id="maxDistance"
                type="number"
                min="1"
                max="50"
                value={data.preferences.maxDeliveryDistance}
                onChange={(e) => updateData('preferences', { maxDeliveryDistance: parseInt(e.target.value) || 10 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preferred Delivery Areas *</Label>
              <Textarea
                placeholder="List the areas/neighborhoods you prefer to deliver to (one per line)"
                rows={4}
                value={data.preferences.deliveryAreas.join('\n')}
                onChange={(e) => updateData('preferences', {
                  deliveryAreas: e.target.value.split('\n').filter(area => area.trim())
                })}
              />
            </div>
          </div>
        );
      
      case 4: // Agreements
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={data.agreements.termsOfService}
                  onCheckedChange={(checked) => updateData('agreements', { termsOfService: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="terms">Terms of Service *</Label>
                  <p className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                      Terms of Service
                    </a>{' '}
                    and understand my responsibilities as a delivery agent.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={data.agreements.privacyPolicy}
                  onCheckedChange={(checked) => updateData('agreements', { privacyPolicy: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="privacy">Privacy Policy *</Label>
                  <p className="text-sm text-gray-600">
                    I acknowledge that I have read and understood the{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                      Privacy Policy
                    </a>.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="contractor"
                  checked={data.agreements.contractorAgreement}
                  onCheckedChange={(checked) => updateData('agreements', { contractorAgreement: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="contractor">Independent Contractor Agreement *</Label>
                  <p className="text-sm text-gray-600">
                    I understand that I will be working as an independent contractor and agree to the{' '}
                    <a href="/contractor-agreement" className="text-blue-600 hover:underline" target="_blank">
                      Contractor Agreement
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Ready to Submit</h4>
                  <p className="text-sm text-green-700">
                    Please review your information before submitting your application.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Personal Information</h4>
                <p className="text-sm text-gray-600">
                  {data.personalInfo.firstName} {data.personalInfo.lastName} • {data.personalInfo.email} • {data.personalInfo.phone}
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Vehicle</h4>
                <p className="text-sm text-gray-600">
                  {data.vehicle.year} {data.vehicle.make} {data.vehicle.model} ({data.vehicle.type}) • {data.vehicle.licensePlate}
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Work Preferences</h4>
                <p className="text-sm text-gray-600">
                  {data.preferences.workingHours.start} - {data.preferences.workingHours.end} • {data.preferences.workingDays.length} days/week
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">What happens next?</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• We'll review your application within 24-48 hours</li>
                    <li>• Background check will be processed (3-5 business days)</li>
                    <li>• You'll receive an email with the approval status</li>
                    <li>• Once approved, you can start accepting delivery requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become a Delivery Agent
          </h1>
          <p className="text-gray-600">
            Join our delivery network and start earning with flexible working hours
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : isCompleted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 0 && 'Please provide your personal information and emergency contact details.'}
              {currentStep === 1 && 'Tell us about your delivery vehicle and insurance information.'}
              {currentStep === 2 && 'Upload the required documents for verification.'}
              {currentStep === 3 && 'Set your work preferences and delivery areas.'}
              {currentStep === 4 && 'Read and accept the terms and agreements.'}
              {currentStep === 5 && 'Review all information before submitting your application.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={submitApplication}
              disabled={loading || !validateStep(currentStep)}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};