import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle, Mail, Clock, FileText, Shield, Phone,
  Calendar, Truck, Users, Star, ArrowRight, Home, 
  MessageCircle, Download, AlertCircle, Plus
} from 'lucide-react';

interface RegistrationSuccessProps {
  applicationId?: string;
  email?: string;
  message?: string;
}

export const DeliveryRegistrationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { applicationId, email, message } = location.state || {};

  const nextSteps = [
    {
      title: 'Document Verification',
      description: 'Our team will review your uploaded documents within 2-3 business days',
      timeframe: '2-3 days',
      icon: FileText,
      status: 'pending'
    },
    {
      title: 'Background Check',
      description: 'We conduct thorough background and driving record checks',
      timeframe: '3-5 days',
      icon: Shield,
      status: 'pending'
    },
    {
      title: 'Training Assignment',
      description: 'Complete online training modules and assessments',
      timeframe: '1-2 days',
      icon: Users,
      status: 'pending'
    },
    {
      title: 'Final Approval',
      description: 'Final review and account activation',
      timeframe: '1 day',
      icon: CheckCircle,
      status: 'pending'
    }
  ];

  const faqs = [
    {
      question: 'When will I hear back about my application?',
      answer: 'You will receive an email update within 2-3 business days once document verification is complete.'
    },
    {
      question: 'What happens if my documents need revision?',
      answer: 'We\'ll email you specific details about what needs to be updated, and you can resubmit through your application portal.'
    },
    {
      question: 'How long does the entire process take?',
      answer: 'The complete onboarding process typically takes 5-10 business days from submission to activation.'
    },
    {
      question: 'Can I start delivering immediately?',
      answer: 'No, you must complete all verification steps and training before being activated as a delivery agent.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Submitted Successfully!
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {message || 'Thank you for your interest in joining our delivery network. Your application is now under review.'}
          </p>
          
          {applicationId && (
            <div className="mt-4">
              <Badge variant="outline" className="px-4 py-2">
                Application ID: {applicationId}
              </Badge>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  What Happens Next?
                </CardTitle>
                <CardDescription>
                  Here's what to expect during the review process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {nextSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{step.title}</h3>
                          <Badge variant="secondary">{step.timeframe}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email Confirmation */}
            {email && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Confirmation Sent</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          We've sent a confirmation email to <strong>{email}</strong>. 
                          This email contains important information about your application and next steps.
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Don't see the email? Check your spam folder or contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="text-gray-600 text-sm mb-4">{faq.answer}</p>
                      {index < faqs.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Important Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      Keep your documents current and ensure all insurance policies remain valid
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      Monitor your email regularly for updates and requests for additional information
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      Training modules will be available once document verification is complete
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Have questions about your application or need assistance?
                  </p>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Support
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    Support Hours: Mon-Fri 9AM-6PM
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Homepage
              </Button>
              <Button variant="outline" onClick={() => navigate('/delivery/register')} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Submit Another Application
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Typical Timeline</CardTitle>
            <CardDescription>
              Here's what most applicants can expect during the onboarding process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Application Submitted</h3>
                    <p className="text-sm text-gray-600">Today - Your application has been received</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Document Review</h3>
                    <p className="text-sm text-gray-600">Days 1-3 - Verification of all submitted documents</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Background Checks</h3>
                    <p className="text-sm text-gray-600">Days 3-7 - Criminal and driving record verification</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Training & Assessment</h3>
                    <p className="text-sm text-gray-600">Days 7-9 - Complete required training modules</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Account Activation</h3>
                    <p className="text-sm text-gray-600">Day 10 - Welcome to the delivery network!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};