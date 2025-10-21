import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormLayout } from '@/components/layout/FormLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Save,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getFieldsForCategory, groupFields, groupLabels, FieldConfig } from '@/types/dynamicFields';
import { DynamicFormField } from '@/components/forms/DynamicFormField';
import { productService, CreateProductData } from '@/services/productService';

const categories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'groceries', name: 'Groceries' },
  { id: 'fashion', name: 'Fashion & Beauty' },
  { id: 'home', name: 'Home & Garden' },
  { id: 'sports', name: 'Sports & Recreation' },
  { id: 'books', name: 'Books & Education' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'services', name: 'Services' }
];

const AddProduct: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, string | number | boolean | string[] | File[] | null | undefined>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentFields, setCurrentFields] = useState<FieldConfig[]>([]);
  const [groupedFields, setGroupedFields] = useState<Record<string, FieldConfig[]>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update fields when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fields = getFieldsForCategory(selectedCategory);
      const grouped = groupFields(fields);
      setCurrentFields(fields);
      setGroupedFields(grouped);
      
      // Reset form data when category changes
      setFormData({});
      setValidationErrors({});
    }
  }, [selectedCategory]);

  const handleFieldChange = (name: string, value: string | number | boolean | string[] | File[] | null | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    currentFields.forEach(field => {
      const value = formData[field.name];
      
      // Check required fields
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        errors[field.name] = `${field.label} is required`;
        isValid = false;
      }
      
      // Check validation rules
      if (value && field.validation) {
        if (field.validation.min && Number(value) < field.validation.min) {
          errors[field.name] = field.validation.message || `Minimum value is ${field.validation.min}`;
          isValid = false;
        }
        if (field.validation.max && Number(value) > field.validation.max) {
          errors[field.name] = field.validation.message || `Maximum value is ${field.validation.max}`;
          isValid = false;
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(String(value))) {
          errors[field.name] = field.validation.message || `Invalid format`;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add a product');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create product data from form data
      const productData: CreateProductData = {
        categoryId: selectedCategory,
        images: (formData.images as File[]) || [],
        description: String(formData.description || ''),
        ...formData
      };
      
      const result = await productService.createProduct(user.id, productData);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success('Product added successfully!');
      setTimeout(() => {
        navigate('/seller/products');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview product:', formData, 'Category:', selectedCategory);
  };

  return (
    <FormLayout
      title="Add New Product"
      subtitle="Create a new product listing for your store"
      backUrl="/seller/products"
      backLabel="Back to Products"
      onSave={handleSubmit}
      onPreview={handlePreview}
      isSaving={isSubmitting}
      canSave={!!selectedCategory}
    >
        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
              Select Product Category
            </CardTitle>
            <CardDescription>
              Choose the category that best describes your product. This will determine the available fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category to get started" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCategory && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Render Dynamic Form Fields by Groups */}
              {Object.entries(groupedFields).map(([groupKey, fields]) => (
                <Card key={groupKey}>
                  <CardHeader>
                    <CardTitle>{groupLabels[groupKey] || groupKey}</CardTitle>
                    <CardDescription>
                      {groupKey === 'basic' && 'Essential product information'}
                      {groupKey === 'specifications' && 'Technical details and specifications'}
                      {groupKey === 'details' && 'Additional product details'}
                      {groupKey === 'pricing' && 'Pricing and stock information'}
                      {groupKey === 'storage' && 'Storage and expiry information'}
                      {groupKey === 'inventory' && 'Inventory management details'}
                      {groupKey === 'delivery' && 'Delivery and shipping information'}
                      {groupKey === 'accessories' && 'Accessories and warranty information'}
                      {groupKey === 'media' && 'Product images and media'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <div 
                          key={field.name} 
                          className={field.type === 'textarea' || field.type === 'file' ? 'md:col-span-2' : ''}
                        >
                          <DynamicFormField
                            field={field}
                            value={formData[field.name]}
                            onChange={handleFieldChange}
                            error={validationErrors[field.name]}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </form>
        )}
    </FormLayout>
  );
};

export default AddProduct;
