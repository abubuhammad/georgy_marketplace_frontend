import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Edit, 
  Eye, 
  Plus, 
  Download, 
  Upload,
  Search,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  Globe,
  Shield,
  Clock,
  Gavel,
  FileCheck
} from 'lucide-react';
import { LegalDocument, DocumentAcknowledgment, DocumentChange, LegalTemplate } from './types';
import { legalService } from '@/services/legalService';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LegalDocumentManager: React.FC = () => {
  const { user } = useAuthContext();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);

  const [newDocument, setNewDocument] = useState({
    type: 'terms_of_service' as const,
    title: '',
    content: '',
    jurisdiction: 'Nigeria',
    language: 'en',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadLegalData();
  }, []);

  const loadLegalData = async () => {
    try {
      setLoading(true);
      const [documentsData, templatesData] = await Promise.all([
        legalService.getLegalDocuments(),
        legalService.getLegalTemplates()
      ]);
      
      setDocuments(documentsData);
      setTemplates(templatesData);
    } catch (error) {
      toast.error('Failed to load legal documents');
      console.error('Legal documents loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async () => {
    try {
      const document = await legalService.createLegalDocument({
        ...newDocument,
        version: '1.0',
        approvedBy: user!.id,
        isActive: false
      });
      
      setDocuments(prev => [document, ...prev]);
      setShowCreateDialog(false);
      setNewDocument({
        type: 'terms_of_service',
        title: '',
        content: '',
        jurisdiction: 'Nigeria',
        language: 'en',
        effectiveDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Legal document created successfully');
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const publishDocument = async (documentId: string) => {
    try {
      await legalService.publishDocument(documentId);
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, isActive: true } : doc
      ));
      toast.success('Document published successfully');
    } catch (error) {
      toast.error('Failed to publish document');
    }
  };

  const createNewVersion = async (documentId: string, changes: string) => {
    try {
      const newVersion = await legalService.createDocumentVersion(documentId, {
        changeDescription: changes,
        changedBy: user!.id,
        impactLevel: 'major'
      });
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? newVersion : doc
      ));
      setShowVersionDialog(false);
      toast.success('New document version created');
    } catch (error) {
      toast.error('Failed to create new version');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      terms_of_service: 'Terms of Service',
      privacy_policy: 'Privacy Policy',
      cookie_policy: 'Cookie Policy',
      refund_policy: 'Refund Policy',
      seller_agreement: 'Seller Agreement',
      data_processing_agreement: 'Data Processing Agreement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDocumentIcon = (type: string) => {
    const icons = {
      terms_of_service: FileText,
      privacy_policy: Shield,
      cookie_policy: Globe,
      refund_policy: FileCheck,
      seller_agreement: Gavel,
      data_processing_agreement: Users
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4" />
          <p>Loading legal documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Legal Document Management</h1>
              <p className="text-gray-600">Manage terms, policies, and legal compliance</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Document
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Documents</p>
                  <p className="text-2xl font-bold">{documents.filter(d => d.isActive).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold">{documents.filter(d => !d.isActive).length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Acknowledgments</p>
                  <p className="text-2xl font-bold">
                    {documents.reduce((sum, doc) => sum + doc.acknowledgments.length, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
                <CardDescription>Manage platform legal documents and policies</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Acknowledgments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getDocumentIcon(document.type)}
                            <div>
                              <p className="font-medium">{document.title}</p>
                              <p className="text-sm text-gray-500">{document.jurisdiction}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getDocumentTypeLabel(document.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{document.version}</TableCell>
                        <TableCell>
                          <Badge variant={document.isActive ? 'default' : 'secondary'}>
                            {document.isActive ? 'Active' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(document.effectiveDate).toLocaleDateString()}</TableCell>
                        <TableCell>{document.acknowledgments.length}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!document.isActive && (
                              <Button 
                                size="sm" 
                                onClick={() => publishDocument(document.id)}
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>Pre-built templates for legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getDocumentIcon(template.type)}
                          {template.name}
                        </CardTitle>
                        <CardDescription>{template.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Jurisdiction:</span>
                            <span>{template.jurisdiction}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Language:</span>
                            <span>{template.language.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Variables:</span>
                            <span>{template.variables.length}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Legal compliance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { regulation: 'GDPR', status: 'Compliant', score: 95 },
                      { regulation: 'CCPA', status: 'Compliant', score: 88 },
                      { regulation: 'PIPEDA', status: 'Review Required', score: 75 },
                      { regulation: 'LGPD', status: 'Compliant', score: 92 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.regulation}</p>
                          <p className="text-sm text-gray-600">{item.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.score}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${
                                item.score >= 90 ? 'bg-green-500' : 
                                item.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Changes</CardTitle>
                  <CardDescription>Document version history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.flatMap(doc => doc.changes).slice(0, 5).map((change, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Version {change.version}</p>
                            <p className="text-sm text-gray-600">{change.changeDescription}</p>
                          </div>
                          <Badge variant={
                            change.impactLevel === 'critical' ? 'destructive' :
                            change.impactLevel === 'major' ? 'default' : 'secondary'
                          }>
                            {change.impactLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(change.changeDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Document Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Legal Document</DialogTitle>
            <DialogDescription>
              Create a new legal document or policy
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select 
                  value={newDocument.type} 
                  onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terms_of_service">Terms of Service</SelectItem>
                    <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                    <SelectItem value="cookie_policy">Cookie Policy</SelectItem>
                    <SelectItem value="refund_policy">Refund Policy</SelectItem>
                    <SelectItem value="seller_agreement">Seller Agreement</SelectItem>
                    <SelectItem value="data_processing_agreement">Data Processing Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={newDocument.effectiveDate}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, effectiveDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select 
                  value={newDocument.jurisdiction} 
                  onValueChange={(value) => setNewDocument(prev => ({ ...prev, jurisdiction: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="European Union">European Union</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select 
                  value={newDocument.language} 
                  onValueChange={(value) => setNewDocument(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Document Content</Label>
              <Textarea
                id="content"
                value={newDocument.content}
                onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter document content..."
                rows={8}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={createDocument} className="flex-1">
                Create Document
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LegalDocumentManager;
