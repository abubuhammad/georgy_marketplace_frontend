import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  User, Truck, FileText, Shield, GraduationCap, CheckCircle,
  Upload, AlertCircle, MapPin, Calendar, Phone, Mail,
  Building, CreditCard, Camera, Star, Clock, ArrowLeft,
  ArrowRight, Save, X, Plus, Minus, Eye, EyeOff
} from 'lucide-react';

interface RegistrationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  required: boolean;
}

interface PersonalInfo {
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
    relationship: string;
    phone: string;
  };
}

interface BusinessInfo {
  registrationType: 'individual' | 'agency' | 'fleet';
  businessName?: string;
  businessRegistrationNumber?: string;
  taxId: string;
  businessAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  yearsInBusiness?: number;
  numberOfEmployees?: number;
}

interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleType: 'car' | 'motorcycle' | 'bicycle' | 'van' | 'truck';
  capacityWeight: number;
  capacityVolume: number;
  hasCooler: boolean;
  hasHeating: boolean;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  inspectionExpiry?: string;
}

interface ServiceInfo {
  serviceAreas: string[];
  deliveryTypes: string[];
  availabilitySchedule: {
    [key: string]: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
  maxDeliveryDistance: number;
  specializations: string[];
}

interface DocumentUpload {
  id: string;
  type: string;
  name: string;
  file?: File;
  url?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  required: boolean;
  description: string;
}

export const DeliveryAgentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();

  // Registration state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
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
      relationship: '',
      phone: ''
    }
  });

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    registrationType: 'individual',
    taxId: '',
    yearsInBusiness: 0,
    numberOfEmployees: 1
  });

  const [vehicles, setVehicles] = useState<VehicleInfo[]>([{
    id: '1',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    vehicleType: 'car',
    capacityWeight: 0,
    capacityVolume: 0,
    hasCooler: false,
    hasHeating: false,
    insurancePolicyNumber: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    inspectionExpiry: ''
  }]);

  const [serviceInfo, setServiceInfo] = useState<ServiceInfo>({
    serviceAreas: [],
    deliveryTypes: [],
    availabilitySchedule: {
      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' }
    },
    maxDeliveryDistance: 25,
    specializations: []
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    {
      id: '1',
      type: 'government_id',
      name: 'Government ID',
      status: 'pending',
      required: true,
      description: 'Valid government-issued photo ID (driver\'s license, passport, etc.)'
    },
    {
      id: '2',
      type: 'drivers_license',
      name: 'Driver\'s License',
      status: 'pending',
      required: true,
      description: 'Valid driver\'s license with clean driving record'
    },
    {
      id: '3',
      type: 'vehicle_registration',
      name: 'Vehicle Registration',
      status: 'pending',
      required: true,
      description: 'Current vehicle registration documents'
    },
    {
      id: '4',
      type: 'insurance',
      name: 'Insurance Policy',
      status: 'pending',
      required: true,
      description: 'Commercial auto insurance policy'
    },
    {
      id: '5',
      type: 'bank_info',
      name: 'Banking Information',
      status: 'pending',
      required: true,
      description: 'Bank account details for payment processing'
    }
  ]);

  const steps: RegistrationStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal and contact details',
      icon: User,
      completed: false,
      required: true
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Business registration and tax information',
      icon: Building,
      completed: false,
      required: true
    },
    {
      id: 'vehicles',
      title: 'Vehicle Information',
      description: 'Vehicle details and specifications',
      icon: Truck,
      completed: false,
      required: true
    },
    {
      id: 'service',
      title: 'Service Areas',
      description: 'Coverage areas and availability',
      icon: MapPin,
      completed: false,
      required: true
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Required verification documents',
      icon: FileText,
      completed: false,
      required: true
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Final review and application submission',
      icon: CheckCircle,
      completed: false,
      required: true
    }
  ];

  const deliveryTypes = [
    'Food & Beverages', 'Packages', 'Groceries', 'Pharmacy',
    'Fragile Items', 'Large Items', 'Documents', 'Flowers',
    'Electronics', 'Clothing', 'Books', 'Medical Supplies'
  ];

  const specializations = [
    'Same-day Delivery', 'Express Delivery', 'White Glove Service',
    'Temperature Controlled', 'Fragile Handling', 'Heavy Lifting',
    'Assembly Required', 'Medical Deliveries', 'Legal Documents',
    'High-Value Items', 'Contactless Delivery', 'Senior-Friendly'
  ];

  useEffect(() => {
    // Allow access without authentication for new agent registration
    // User will be created as part of the onboarding process
  }, []);

  const validatePersonalInfo = (): boolean => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
    const addressRequired = ['street', 'city', 'state', 'postalCode'];
    const emergencyRequired = ['name', 'relationship', 'phone'];

    for (const field of required) {
      if (!personalInfo[field as keyof PersonalInfo]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    for (const field of addressRequired) {
      if (!personalInfo.address[field as keyof typeof personalInfo.address]) {
        toast.error(`Please fill in address ${field}`);
        return false;
      }
    }

    for (const field of emergencyRequired) {
      if (!personalInfo.emergencyContact[field as keyof typeof personalInfo.emergencyContact]) {
        toast.error(`Please fill in emergency contact ${field}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(personalInfo.phone)) {
      toast.error('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const validateBusinessInfo = (): boolean => {
    if (!businessInfo.taxId) {
      toast.error('Tax ID is required');
      return false;
    }

    if (businessInfo.registrationType !== 'individual') {
      if (!businessInfo.businessName) {
        toast.error('Business name is required for agencies and fleets');
        return false;
      }
      if (!businessInfo.businessRegistrationNumber) {
        toast.error('Business registration number is required');
        return false;
      }
    }

    return true;
  };

  const validateVehicles = (): boolean => {
    if (vehicles.length === 0) {
      toast.error('At least one vehicle is required');
      return false;
    }

    for (const vehicle of vehicles) {
      const required = ['make', 'model', 'year', 'licensePlate', 'color', 'insurancePolicyNumber', 'insuranceExpiry', 'registrationExpiry'];
      for (const field of required) {
        if (!vehicle[field as keyof VehicleInfo]) {
          toast.error(`Please fill in vehicle ${field} for all vehicles`);
          return false;
        }
      }
    }

    return true;
  };

  const validateServiceInfo = (): boolean => {
    if (serviceInfo.serviceAreas.length === 0) {
      toast.error('Please select at least one service area');
      return false;
    }

    if (serviceInfo.deliveryTypes.length === 0) {
      toast.error('Please select at least one delivery type');
      return false;
    }

    return true;
  };

  const validateDocuments = (): boolean => {
    const requiredDocs = documents.filter(doc => doc.required);
    const uploadedDocs = requiredDocs.filter(doc => doc.file || doc.url);

    if (uploadedDocs.length < requiredDocs.length) {
      toast.error('Please upload all required documents');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    let isValid = true;

    switch (currentStep) {
      case 0:
        isValid = validatePersonalInfo();
        break;
      case 1:
        isValid = validateBusinessInfo();
        break;
      case 2:
        isValid = validateVehicles();
        break;
      case 3:
        isValid = validateServiceInfo();
        break;
      case 4:
        isValid = validateDocuments();
        break;
    }

    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        await saveProgress();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const saveProgress = async () => {
    setLoading(true);
    try {
      const registrationData = {
        personalInfo,
        businessInfo,
        vehicles,
        serviceInfo,
        currentStep,
        status: 'in_progress'
      };

      const response = registrationId
        ? await apiClient.put(`/api/delivery/registration/${registrationId}`, registrationData)
        : await apiClient.post('/api/delivery/registration', registrationData);

      if (response.success) {
        if (!registrationId) {
          setRegistrationId(response.data.id);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentId: string, file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documents.find(d => d.id === documentId)?.type || '');
      formData.append('registrationId', registrationId || '');

      const response = await apiClient.post('/api/delivery/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.success) {
        setDocuments(prev => prev.map(doc =>
          doc.id === documentId
            ? { ...doc, file, url: response.data.url, status: 'uploaded' }
            : doc
        ));
        toast.success('Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      // Create user account and delivery agent application in one step
      const applicationData = {
        // User account creation data
        userData: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          role: businessInfo.registrationType === 'individual' ? 'delivery_agent' : 'delivery_agency',
          // Generate temporary password - user will be prompted to set password via email
          generatePassword: true
        },
        // Agent/Agency application data
        agentData: {
          personalInfo,
          businessInfo,
          vehicles,
          serviceInfo,
          documents: documents.filter(doc => doc.file || doc.url),
          status: 'pending_review'
        }
      };

      const response = await apiClient.post('/api/delivery/complete-registration', {
        registrationId,
        ...applicationData
      });

      if (response.success) {
        toast.success('Registration completed! Check your email for login instructions.');
        navigate('/delivery/registration/success', {
          state: { 
            applicationId: response.data.applicationId,
            email: personalInfo.email,
            message: 'Registration completed successfully! You will receive an email with login instructions once your application is reviewed.'
          }
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = () => {
    const newVehicle: VehicleInfo = {
      id: Date.now().toString(),
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      color: '',
      vehicleType: 'car',
      capacityWeight: 0,
      capacityVolume: 0,
      hasCooler: false,
      hasHeating: false,
      insurancePolicyNumber: '',
      insuranceExpiry: '',
      registrationExpiry: '',
      inspectionExpiry: ''
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const removeVehicle = (vehicleId: string) => {
    if (vehicles.length > 1) {
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    }
  };

  const updateVehicle = (vehicleId: string, updates: Partial<VehicleInfo>) => {
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, ...updates } : v
    ));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Enter your last name"
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
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={personalInfo.dateOfBirth}
          onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          required
        />
      </div>

      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Address Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={personalInfo.address.street}
              onChange={(e) => setPersonalInfo(prev => ({
                ...prev,
                address: { ...prev.address, street: e.target.value }
              }))}
              placeholder="123 Main Street"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={personalInfo.address.city}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                placeholder="New York"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={personalInfo.address.state}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  address: { ...prev.address, state: e.target.value }
                }))}
                placeholder="NY"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={personalInfo.address.postalCode}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  address: { ...prev.address, postalCode: e.target.value }
                }))}
                placeholder="10001"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Full Name *</Label>
              <Input
                id="emergencyName"
                value={personalInfo.emergencyContact.name}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                }))}
                placeholder="Contact full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Relationship *</Label>
              <Input
                id="emergencyRelationship"
                value={personalInfo.emergencyContact.relationship}
                onChange={(e) => setPersonalInfo(prev => ({
                  ...prev,
                  emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                }))}
                placeholder="Spouse, Parent, etc."
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Phone Number *</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={personalInfo.emergencyContact.phone}
              onChange={(e) => setPersonalInfo(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
              }))}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessInfoStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Registration Type *</Label>
        <Select
          value={businessInfo.registrationType}
          onValueChange={(value: 'individual' | 'agency' | 'fleet') =>
            setBusinessInfo(prev => ({ ...prev, registrationType: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual Agent</SelectItem>
            <SelectItem value="agency">Delivery Agency</SelectItem>
            <SelectItem value="fleet">Fleet Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {businessInfo.registrationType !== 'individual' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={businessInfo.businessName || ''}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="Your Business Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessRegistrationNumber">Business Registration Number *</Label>
            <Input
              id="businessRegistrationNumber"
              value={businessInfo.businessRegistrationNumber || ''}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessRegistrationNumber: e.target.value }))}
              placeholder="Registration number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                value={businessInfo.yearsInBusiness || ''}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, yearsInBusiness: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfEmployees">Number of Employees</Label>
              <Input
                id="numberOfEmployees"
                type="number"
                value={businessInfo.numberOfEmployees || ''}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, numberOfEmployees: parseInt(e.target.value) || 1 }))}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="taxId">Tax ID / SSN *</Label>
        <Input
          id="taxId"
          value={businessInfo.taxId}
          onChange={(e) => setBusinessInfo(prev => ({ ...prev, taxId: e.target.value }))}
          placeholder="XXX-XX-XXXX"
          required
        />
      </div>
    </div>
  );

  const renderVehicleCard = (vehicle: VehicleInfo, index: number) => (
    <Card key={vehicle.id} className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vehicle {index + 1}</CardTitle>
          {vehicles.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeVehicle(vehicle.id)}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Make *</Label>
            <Input
              value={vehicle.make}
              onChange={(e) => updateVehicle(vehicle.id, { make: e.target.value })}
              placeholder="Toyota"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Model *</Label>
            <Input
              value={vehicle.model}
              onChange={(e) => updateVehicle(vehicle.id, { model: e.target.value })}
              placeholder="Prius"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Year *</Label>
            <Input
              type="number"
              value={vehicle.year}
              onChange={(e) => updateVehicle(vehicle.id, { year: parseInt(e.target.value) || new Date().getFullYear() })}
              min="1990"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>License Plate *</Label>
            <Input
              value={vehicle.licensePlate}
              onChange={(e) => updateVehicle(vehicle.id, { licensePlate: e.target.value })}
              placeholder="ABC-1234"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Color *</Label>
            <Input
              value={vehicle.color}
              onChange={(e) => updateVehicle(vehicle.id, { color: e.target.value })}
              placeholder="White"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Vehicle Type *</Label>
          <Select
            value={vehicle.vehicleType}
            onValueChange={(value: VehicleInfo['vehicleType']) =>
              updateVehicle(vehicle.id, { vehicleType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
              <SelectItem value="bicycle">Bicycle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Capacity Weight (kg)</Label>
            <Input
              type="number"
              value={vehicle.capacityWeight}
              onChange={(e) => updateVehicle(vehicle.id, { capacityWeight: parseFloat(e.target.value) || 0 })}
              placeholder="500"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Capacity Volume (m³)</Label>
            <Input
              type="number"
              value={vehicle.capacityVolume}
              onChange={(e) => updateVehicle(vehicle.id, { capacityVolume: parseFloat(e.target.value) || 0 })}
              placeholder="2.5"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`cooler-${vehicle.id}`}
              checked={vehicle.hasCooler}
              onCheckedChange={(checked) => updateVehicle(vehicle.id, { hasCooler: checked as boolean })}
            />
            <Label htmlFor={`cooler-${vehicle.id}`}>Has Cooler</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`heating-${vehicle.id}`}
              checked={vehicle.hasHeating}
              onCheckedChange={(checked) => updateVehicle(vehicle.id, { hasHeating: checked as boolean })}
            />
            <Label htmlFor={`heating-${vehicle.id}`}>Has Heating</Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold">Insurance & Registration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Insurance Policy Number *</Label>
              <Input
                value={vehicle.insurancePolicyNumber}
                onChange={(e) => updateVehicle(vehicle.id, { insurancePolicyNumber: e.target.value })}
                placeholder="POL123456789"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Insurance Expiry Date *</Label>
              <Input
                type="date"
                value={vehicle.insuranceExpiry}
                onChange={(e) => updateVehicle(vehicle.id, { insuranceExpiry: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Registration Expiry Date *</Label>
              <Input
                type="date"
                value={vehicle.registrationExpiry}
                onChange={(e) => updateVehicle(vehicle.id, { registrationExpiry: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Inspection Expiry Date</Label>
              <Input
                type="date"
                value={vehicle.inspectionExpiry}
                onChange={(e) => updateVehicle(vehicle.id, { inspectionExpiry: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderVehiclesStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vehicle Information</h3>
        <Button onClick={addVehicle} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>
      
      <div className="space-y-6">
        {vehicles.map((vehicle, index) => renderVehicleCard(vehicle, index))}
      </div>
    </div>
  );

  const renderServiceInfoStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Service Areas</h3>
        <div className="space-y-2">
          <Label>Maximum Delivery Distance (km)</Label>
          <Input
            type="number"
            value={serviceInfo.maxDeliveryDistance}
            onChange={(e) => setServiceInfo(prev => ({ ...prev, maxDeliveryDistance: parseInt(e.target.value) || 25 }))}
            placeholder="25"
            min="1"
            max="100"
          />
        </div>
        <div className="space-y-2">
          <Label>Service Areas (Cities/Regions) *</Label>
          <Textarea
            value={serviceInfo.serviceAreas.join(', ')}
            onChange={(e) => setServiceInfo(prev => ({
              ...prev,
              serviceAreas: e.target.value.split(',').map(area => area.trim()).filter(area => area)
            }))}
            placeholder="Enter cities or regions separated by commas (e.g., New York, Brooklyn, Queens)"
            rows={3}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Delivery Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {deliveryTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`delivery-${type}`}
                checked={serviceInfo.deliveryTypes.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setServiceInfo(prev => ({
                      ...prev,
                      deliveryTypes: [...prev.deliveryTypes, type]
                    }));
                  } else {
                    setServiceInfo(prev => ({
                      ...prev,
                      deliveryTypes: prev.deliveryTypes.filter(t => t !== type)
                    }));
                  }
                }}
              />
              <Label htmlFor={`delivery-${type}`} className="text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Specializations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {specializations.map((spec) => (
            <div key={spec} className="flex items-center space-x-2">
              <Checkbox
                id={`spec-${spec}`}
                checked={serviceInfo.specializations.includes(spec)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setServiceInfo(prev => ({
                      ...prev,
                      specializations: [...prev.specializations, spec]
                    }));
                  } else {
                    setServiceInfo(prev => ({
                      ...prev,
                      specializations: prev.specializations.filter(s => s !== spec)
                    }));
                  }
                }}
              />
              <Label htmlFor={`spec-${spec}`} className="text-sm">{spec}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Availability Schedule</h3>
        <div className="space-y-3">
          {Object.entries(serviceInfo.availabilitySchedule).map(([day, schedule]) => (
            <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`schedule-${day}`}
                  checked={schedule.enabled}
                  onCheckedChange={(checked) => {
                    setServiceInfo(prev => ({
                      ...prev,
                      availabilitySchedule: {
                        ...prev.availabilitySchedule,
                        [day]: { ...schedule, enabled: checked as boolean }
                      }
                    }));
                  }}
                />
                <Label htmlFor={`schedule-${day}`} className="w-20 capitalize">{day}</Label>
              </div>
              
              {schedule.enabled && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">From:</Label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => {
                        setServiceInfo(prev => ({
                          ...prev,
                          availabilitySchedule: {
                            ...prev.availabilitySchedule,
                            [day]: { ...schedule, startTime: e.target.value }
                          }
                        }));
                      }}
                      className="w-auto"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">To:</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => {
                        setServiceInfo(prev => ({
                          ...prev,
                          availabilitySchedule: {
                            ...prev.availabilitySchedule,
                            [day]: { ...schedule, endTime: e.target.value }
                          }
                        }));
                      }}
                      className="w-auto"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
        <p className="text-gray-600">Upload the required documents to complete your application</p>
      </div>

      <div className="space-y-4">
        {documents.map((document) => (
          <Card key={document.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h4 className="font-medium">{document.name}</h4>
                    {document.required && <Badge variant="outline">Required</Badge>}
                    <Badge
                      className={
                        document.status === 'uploaded'
                          ? 'bg-green-100 text-green-800'
                          : document.status === 'verified'
                          ? 'bg-blue-100 text-blue-800'
                          : document.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {document.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{document.description}</p>
                  {document.file && (
                    <p className="text-sm text-blue-600 mt-1">File: {document.file.name}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {document.file || document.url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.jpg,.jpeg,.png';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileUpload(document.id, file);
                        };
                        input.click();
                      }}
                    >
                      Replace
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.jpg,.jpeg,.png';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) handleFileUpload(document.id, file);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Document Requirements</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• All documents must be clear and readable</li>
              <li>• Accepted formats: PDF, JPG, JPEG, PNG</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Documents must be current and not expired</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Review Your Application</h3>
        <p className="text-gray-600">Please review all information before submitting</p>
      </div>

      {/* Personal Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}</p>
          <p><strong>Email:</strong> {personalInfo.email}</p>
          <p><strong>Phone:</strong> {personalInfo.phone}</p>
          <p><strong>Address:</strong> {personalInfo.address.street}, {personalInfo.address.city}, {personalInfo.address.state} {personalInfo.address.postalCode}</p>
          <p><strong>Emergency Contact:</strong> {personalInfo.emergencyContact.name} ({personalInfo.emergencyContact.relationship}) - {personalInfo.emergencyContact.phone}</p>
        </CardContent>
      </Card>

      {/* Business Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Registration Type:</strong> {businessInfo.registrationType.charAt(0).toUpperCase() + businessInfo.registrationType.slice(1)}</p>
          {businessInfo.businessName && <p><strong>Business Name:</strong> {businessInfo.businessName}</p>}
          {businessInfo.businessRegistrationNumber && <p><strong>Registration Number:</strong> {businessInfo.businessRegistrationNumber}</p>}
          <p><strong>Tax ID:</strong> {businessInfo.taxId}</p>
        </CardContent>
      </Card>

      {/* Vehicles Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Vehicles ({vehicles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="p-3 border rounded-lg">
              <p><strong>Vehicle {index + 1}:</strong> {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.color})</p>
              <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
              <p><strong>Type:</strong> {vehicle.vehicleType.charAt(0).toUpperCase() + vehicle.vehicleType.slice(1)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Service Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Service Areas:</strong> {serviceInfo.serviceAreas.join(', ')}</p>
          <p><strong>Delivery Types:</strong> {serviceInfo.deliveryTypes.join(', ')}</p>
          <p><strong>Max Distance:</strong> {serviceInfo.maxDeliveryDistance} km</p>
          {serviceInfo.specializations.length > 0 && (
            <p><strong>Specializations:</strong> {serviceInfo.specializations.join(', ')}</p>
          )}
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((document) => (
              <div key={document.id} className="flex justify-between items-center">
                <span>{document.name}</span>
                <Badge
                  className={
                    document.status === 'uploaded'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {document.status === 'uploaded' ? 'Uploaded' : 'Not Uploaded'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Before You Submit</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Ensure all information is accurate and complete</li>
              <li>• All required documents have been uploaded</li>
              <li>• You have read and agree to the terms and conditions</li>
              <li>• Your application will be reviewed within 3-5 business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Agent Registration</h1>
          <p className="text-gray-600">Join our delivery network and start earning</p>
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
        <div className="flex justify-between mb-8 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg min-w-0 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium hidden sm:block truncate">{step.title}</span>
                {isCompleted && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
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
                {currentStep === 0 && renderPersonalInfoStep()}
                {currentStep === 1 && renderBusinessInfoStep()}
                {currentStep === 2 && renderVehiclesStep()}
                {currentStep === 3 && renderServiceInfoStep()}
                {currentStep === 4 && renderDocumentsStep()}
                {currentStep === 5 && renderReviewStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveProgress}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};