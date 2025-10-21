import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { validateResumeFile, validateResumeText, JobValidationError, JobPermissionError, checkResumeUploadPermission } from '@/lib/job-validation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, FileText, Download, Trash2 } from 'lucide-react';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');

  // Mock current resume data
  const [currentResume] = useState({
    fileName: 'John_Doe_Resume_2024.pdf',
    uploadedAt: '2024-01-10',
    size: '245 KB'
  });

  // Check if user has permission
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to upload your resume.
          </p>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  try {
    checkResumeUploadPermission(user.role);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        validateResumeFile(file);
        setResumeFile(file);
      } catch (error) {
        if (error instanceof JobValidationError) {
          toast.error(error.message);
        } else {
          toast.error('Invalid file. Please try again.');
        }
      }
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      
      let result;
      
      if (uploadMode === 'file') {
        if (!resumeFile) {
          toast.error('Please select a file to upload.');
          return;
        }
        
        // Validate file again before upload
        validateResumeFile(resumeFile);
        result = await apiClient.uploadResume(resumeFile);
        
      } else if (uploadMode === 'text') {
        if (!resumeText.trim()) {
          toast.error('Please enter your resume content.');
          return;
        }
        
        // Validate resume text
        validateResumeText(resumeText.trim());
        result = await apiClient.updateResumeText(resumeText.trim());
      }
      
      if (result?.success) {
        toast.success('Resume updated successfully!');
        navigate('/job-seeker/dashboard');
      } else {
        toast.error(result?.error || 'Failed to upload resume. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      if (error instanceof JobValidationError) {
        toast.error(`Validation Error: ${error.message}`);
      } else {
        toast.error('Failed to upload resume. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setLoading(true);
      
      const result = await apiClient.deleteResume();
      
      if (result.success) {
        toast.success('Resume deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete resume.');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume.');
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
          onClick={() => navigate('/job-seeker/dashboard')}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Current Resume */}
        {currentResume && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Current Resume
              </CardTitle>
              <CardDescription>Your currently uploaded resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{currentResume.fileName}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded on {currentResume.uploadedAt} • {currentResume.size}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeleteResume}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload New Resume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload New Resume
            </CardTitle>
            <CardDescription>
              Upload your resume to help employers find you. Supported formats: PDF, DOC, DOCX
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Mode Selection */}
            <div className="flex space-x-4">
              <Button
                variant={uploadMode === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMode('file')}
              >
                Upload File
              </Button>
              <Button
                variant={uploadMode === 'text' ? 'default' : 'outline'}
                onClick={() => setUploadMode('text')}
              >
                Enter Text
              </Button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume File</Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Maximum file size: 5MB. Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>
                
                {resumeFile && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {resumeFile.name}
                      </span>
                      <span className="text-sm text-blue-600">
                        ({(resumeFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="resumeText">Resume Content</Label>
                <Textarea
                  id="resumeText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste or type your resume content here..."
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500">
                  You can paste your resume content directly here. Include your contact information, 
                  work experience, education, and skills.
                </p>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => navigate('/job-seeker/dashboard')}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Resume'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">✅ Do:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use a clean, professional format</li>
                  <li>• Include relevant keywords for your industry</li>
                  <li>• Quantify your achievements with numbers</li>
                  <li>• Keep it to 1-2 pages maximum</li>
                  <li>• Use action verbs to describe your experience</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">❌ Don't:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Include personal information like age or photo</li>
                  <li>• Use fancy fonts or excessive formatting</li>
                  <li>• Include references (unless requested)</li>
                  <li>• Use generic objectives or summaries</li>
                  <li>• Submit without proofreading</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeUpload;