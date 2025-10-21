import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { JobPostingForm } from '@/features/job/components/JobPostingForm';
import { JobPostingData } from '@/features/job/types';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { validateJobPosting, JobValidationError, JobPermissionError, checkJobPostingPermission } from '@/lib/job-validation';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check if user has permission to post jobs
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to post job listings.
          </p>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  try {
    checkJobPostingPermission(user.role);
  } catch (error) {
    if (error instanceof JobPermissionError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {error.message}
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      );
    }
  }

  const handleJobSubmit = async (data: JobPostingData) => {
    try {
      setLoading(true);
      
      // Validate job posting data
      validateJobPosting(data);
      
      console.log('Posting job:', data);
      
      const result = await apiClient.postJob(data);
      
      if (result.success) {
        toast.success('Job posted successfully!');
        navigate('/employer/dashboard');
      } else {
        toast.error(result.error || 'Failed to post job. Please try again.');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      
      if (error instanceof JobValidationError) {
        toast.error(`Validation Error: ${error.message}`);
      } else {
        toast.error('Failed to post job. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/employer/dashboard')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <JobPostingForm
          onSubmit={handleJobSubmit}
          loading={loading}
          mode="create"
        />
      </div>
    </div>
  );
};

export default PostJob;