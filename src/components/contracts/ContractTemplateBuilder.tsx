import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Copy, 
  FileText, 
  Settings,
  DollarSign,
  Calendar,
  User,
  Building,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface ContractTerm {
  id: string;
  section: string;
  field: string;
  label: string;
  value: string | number;
  type: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'select';
  options?: string[];
  required: boolean;
  negotiable: boolean;
  description?: string;
  order: number;
}

interface ContractTemplate {
  id: string;
  name: string;
  type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  industry: string;
  description?: string;
  terms: ContractTerm[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface ContractTemplateBuilderProps {
  template?: ContractTemplate;
  onSave: (template: ContractTemplate) => void;
  onCancel: () => void;
}

const CONTRACT_SECTIONS = [
  'Basic Information',
  'Compensation',
  'Work Schedule',
  'Benefits',
  'Responsibilities',
  'Legal Terms',
  'Termination',
  'Confidentiality'
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Dropdown' }
];

const CONTRACT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' }
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Consulting',
  'Marketing',
  'Legal',
  'Other'
];

const DEFAULT_TERMS: Partial<ContractTerm>[] = [
  {
    section: 'Basic Information',
    field: 'job_title',
    label: 'Job Title',
    type: 'text',
    required: true,
    negotiable: false
  },
  {
    section: 'Basic Information',
    field: 'start_date',
    label: 'Start Date',
    type: 'date',
    required: true,
    negotiable: true
  },
  {
    section: 'Compensation',
    field: 'salary',
    label: 'Annual Salary',
    type: 'currency',
    required: true,
    negotiable: true
  },
  {
    section: 'Compensation',
    field: 'currency',
    label: 'Currency',
    type: 'select',
    options: ['NGN', 'USD', 'EUR', 'GBP'],
    required: true,
    negotiable: false
  },
  {
    section: 'Work Schedule',
    field: 'work_hours',
    label: 'Work Hours per Week',
    type: 'number',
    required: true,
    negotiable: true
  },
  {
    section: 'Work Schedule',
    field: 'remote_work',
    label: 'Remote Work Allowed',
    type: 'boolean',
    required: false,
    negotiable: true
  },
  {
    section: 'Benefits',
    field: 'health_insurance',
    label: 'Health Insurance',
    type: 'boolean',
    required: false,
    negotiable: true
  },
  {
    section: 'Legal Terms',
    field: 'probation_period',
    label: 'Probation Period (months)',
    type: 'number',
    required: false,
    negotiable: true
  },
  {
    section: 'Termination',
    field: 'notice_period',
    label: 'Notice Period (days)',
    type: 'number',
    required: true,
    negotiable: true
  }
];

export function ContractTemplateBuilder({ 
  template, 
  onSave, 
  onCancel 
}: ContractTemplateBuilderProps) {
  const [currentTemplate, setCurrentTemplate] = useState<ContractTemplate>(
    template || {
      id: `template-${Date.now()}`,
      name: 'New Contract Template',
      type: 'full_time',
      industry: 'Technology',
      description: '',
      terms: DEFAULT_TERMS.map((term, index) => ({
        ...term,
        id: `term-${Date.now()}-${index}`,
        value: '',
        order: index
      } as ContractTerm)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  );

  const [newTerm, setNewTerm] = useState<Partial<ContractTerm>>({
    section: 'Basic Information',
    type: 'text',
    required: true,
    negotiable: true
  });

  const updateTemplate = (updates: Partial<ContractTemplate>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  };

  const addTerm = () => {
    if (!newTerm.label || !newTerm.field) return;

    const term: ContractTerm = {
      id: `term-${Date.now()}`,
      section: newTerm.section!,
      field: newTerm.field!,
      label: newTerm.label!,
      value: newTerm.value || '',
      type: newTerm.type!,
      options: newTerm.options,
      required: newTerm.required!,
      negotiable: newTerm.negotiable!,
      description: newTerm.description,
      order: currentTemplate.terms.length
    };

    updateTemplate({
      terms: [...currentTemplate.terms, term]
    });

    setNewTerm({
      section: 'Basic Information',
      type: 'text',
      required: true,
      negotiable: true
    });
  };

  const updateTerm = (termId: string, updates: Partial<ContractTerm>) => {
    const updatedTerms = currentTemplate.terms.map(term =>
      term.id === termId ? { ...term, ...updates } : term
    );
    updateTemplate({ terms: updatedTerms });
  };

  const deleteTerm = (termId: string) => {
    const updatedTerms = currentTemplate.terms.filter(term => term.id !== termId);
    updateTemplate({ terms: updatedTerms });
  };

  const duplicateTerm = (termId: string) => {
    const termToDuplicate = currentTemplate.terms.find(term => term.id === termId);
    if (!termToDuplicate) return;

    const duplicatedTerm: ContractTerm = {
      ...termToDuplicate,
      id: `term-${Date.now()}`,
      label: `${termToDuplicate.label} (Copy)`,
      field: `${termToDuplicate.field}_copy`,
      order: currentTemplate.terms.length
    };

    updateTemplate({
      terms: [...currentTemplate.terms, duplicatedTerm]
    });
  };

  const moveTermUp = (termId: string) => {
    const termIndex = currentTemplate.terms.findIndex(t => t.id === termId);
    if (termIndex <= 0) return;

    const newTerms = [...currentTemplate.terms];
    [newTerms[termIndex], newTerms[termIndex - 1]] = [newTerms[termIndex - 1], newTerms[termIndex]];
    
    // Update order values
    newTerms.forEach((term, index) => {
      term.order = index;
    });

    updateTemplate({ terms: newTerms });
  };

  const moveTermDown = (termId: string) => {
    const termIndex = currentTemplate.terms.findIndex(t => t.id === termId);
    if (termIndex >= currentTemplate.terms.length - 1) return;

    const newTerms = [...currentTemplate.terms];
    [newTerms[termIndex], newTerms[termIndex + 1]] = [newTerms[termIndex + 1], newTerms[termIndex]];
    
    // Update order values
    newTerms.forEach((term, index) => {
      term.order = index;
    });

    updateTemplate({ terms: newTerms });
  };

  const groupedTerms = currentTemplate.terms.reduce((acc, term) => {
    if (!acc[term.section]) {
      acc[term.section] = [];
    }
    acc[term.section].push(term);
    return acc;
  }, {} as Record<string, ContractTerm[]>);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Contract Template Builder
              </CardTitle>
              <p className="text-gray-500 mt-1">
                Create and customize employment contract templates
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => onSave(currentTemplate)}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={currentTemplate.name}
                onChange={(e) => updateTemplate({ name: e.target.value })}
                placeholder="Enter template name..."
              />
            </div>
            <div>
              <Label>Contract Type</Label>
              <Select
                value={currentTemplate.type}
                onValueChange={(value: any) => updateTemplate({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Industry</Label>
              <Select
                value={currentTemplate.industry}
                onValueChange={(value) => updateTemplate({ industry: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label>Description</Label>
              <Textarea
                value={currentTemplate.description}
                onChange={(e) => updateTemplate({ description: e.target.value })}
                placeholder="Template description..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Terms */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contract Terms ({currentTemplate.terms.length})</CardTitle>
              <Badge variant="outline">
                {currentTemplate.terms.filter(t => t.required).length} required
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(groupedTerms)[0] || 'Basic Information'} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {CONTRACT_SECTIONS.slice(0, 4).map(section => (
                  <TabsTrigger key={section} value={section} className="text-xs">
                    {section}
                  </TabsTrigger>
                ))}
              </TabsList>

              {CONTRACT_SECTIONS.map(section => (
                <TabsContent key={section} value={section} className="space-y-4">
                  {groupedTerms[section]?.map(term => (
                    <Card key={term.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={term.label}
                              onChange={(e) => updateTerm(term.id, { label: e.target.value })}
                              className="font-medium"
                              placeholder="Term label..."
                            />
                            {term.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            {term.negotiable && (
                              <Badge variant="outline" className="text-xs">Negotiable</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input
                              value={term.field}
                              onChange={(e) => updateTerm(term.id, { field: e.target.value })}
                              placeholder="Field name..."
                              className="text-sm"
                            />
                            <Select
                              value={term.type}
                              onValueChange={(value: any) => updateTerm(term.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {term.type === 'select' && (
                            <Textarea
                              value={term.options?.join('\n') || ''}
                              onChange={(e) => updateTerm(term.id, { 
                                options: e.target.value.split('\n').filter(o => o.trim()) 
                              })}
                              placeholder="Enter options (one per line)..."
                              rows={3}
                              className="text-sm"
                            />
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={term.required}
                                onCheckedChange={(checked) => updateTerm(term.id, { required: checked })}
                              />
                              <Label className="text-sm">Required</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={term.negotiable}
                                onCheckedChange={(checked) => updateTerm(term.id, { negotiable: checked })}
                              />
                              <Label className="text-sm">Negotiable</Label>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => moveTermUp(term.id)}
                          >
                            ↑
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => moveTermDown(term.id)}
                          >
                            ↓
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => duplicateTerm(term.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => deleteTerm(term.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <p>No terms in this section yet</p>
                      <p className="text-sm">Add terms using the form on the right</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Term Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Term
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Section</Label>
              <Select
                value={newTerm.section}
                onValueChange={(value) => setNewTerm(prev => ({ ...prev, section: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_SECTIONS.map(section => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Field Name</Label>
              <Input
                value={newTerm.field || ''}
                onChange={(e) => setNewTerm(prev => ({ ...prev, field: e.target.value }))}
                placeholder="e.g., salary, start_date"
              />
            </div>

            <div>
              <Label>Display Label</Label>
              <Input
                value={newTerm.label || ''}
                onChange={(e) => setNewTerm(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Annual Salary, Start Date"
              />
            </div>

            <div>
              <Label>Field Type</Label>
              <Select
                value={newTerm.type}
                onValueChange={(value: any) => setNewTerm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newTerm.type === 'select' && (
              <div>
                <Label>Options</Label>
                <Textarea
                  value={newTerm.options?.join('\n') || ''}
                  onChange={(e) => setNewTerm(prev => ({ 
                    ...prev, 
                    options: e.target.value.split('\n').filter(o => o.trim()) 
                  }))}
                  placeholder="Enter options (one per line)..."
                  rows={3}
                />
              </div>
            )}

            <div>
              <Label>Description</Label>
              <Textarea
                value={newTerm.description || ''}
                onChange={(e) => setNewTerm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description or help text"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTerm.required}
                  onCheckedChange={(checked) => setNewTerm(prev => ({ ...prev, required: checked }))}
                />
                <Label>Required Field</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTerm.negotiable}
                  onCheckedChange={(checked) => setNewTerm(prev => ({ ...prev, negotiable: checked }))}
                />
                <Label>Negotiable</Label>
              </div>
            </div>

            <Button 
              onClick={addTerm}
              disabled={!newTerm.label || !newTerm.field}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Template Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Template Status</Label>
              <p className="text-sm text-gray-600 mb-3">
                Active templates are available for creating new contracts
              </p>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentTemplate.isActive}
                  onCheckedChange={(checked) => updateTemplate({ isActive: checked })}
                />
                <Label>Active Template</Label>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Template Summary</Label>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Terms:</span>
                  <span className="font-medium">{currentTemplate.terms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Terms:</span>
                  <span className="font-medium text-red-600">
                    {currentTemplate.terms.filter(t => t.required).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Negotiable Terms:</span>
                  <span className="font-medium text-blue-600">
                    {currentTemplate.terms.filter(t => t.negotiable).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sections:</span>
                  <span className="font-medium">
                    {Object.keys(groupedTerms).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContractTemplateBuilder;
