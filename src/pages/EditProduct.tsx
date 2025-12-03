import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormLayout } from '@/components/layout/FormLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getFieldsForCategory, groupFields, groupLabels, FieldConfig } from '@/types/dynamicFields';
import { DynamicFormField } from '@/components/forms/DynamicFormField';
import { productService } from '@/services/productService';
import { apiClient } from '@/lib/apiClient';
import categoryApiService, { Category } from '@/services/categoryApiService';

// Fallback categories for when API is not available
const fallbackCategories = [
  { id: 'electronics', name: 'Electronics', slug: 'electronics' },
  { id: 'groceries', name: 'Groceries', slug: 'groceries' },
  { id: 'fashion', name: 'Fashion & Beauty', slug: 'fashion' },
  { id: 'home', name: 'Home & Garden', slug: 'home-garden' },
  { id: 'sports', name: 'Sports & Recreation', slug: 'sports' },
  { id: 'books', name: 'Books & Education', slug: 'books' },
  { id: 'vehicles', name: 'Vehicles', slug: 'vehicles' },
  { id: 'services', name: 'Services', slug: 'services' }
];

const EditProduct: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentFields, setCurrentFields] = useState<FieldConfig[]>([]);
  const [groupedFields, setGroupedFields] = useState<Record<string, FieldConfig[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Load categories from API on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await categoryApiService.getProductCategories();
        if (data && data.length > 0) {
          const mappedCategories = data.map((cat: Category) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }));
          setCategories(mappedCategories);
        } else {
          console.warn('Using fallback categories:', error);
          setCategories(fallbackCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories(fallbackCategories);
      }
    };
    loadCategories();
  }, []);

  // Load product data after categories are loaded
  useEffect(() => {
    if (id && categories.length > 0) {
      loadProductData();
    }
  }, [id, categories]);

  // Update fields when category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      // Find the category slug for field lookup
      const category = categories.find(c => c.id === selectedCategory);
      const slug = category?.slug || selectedCategory;
      setSelectedCategorySlug(slug);
      
      const fields = getFieldsForCategory(slug);
      const grouped = groupFields(fields);
      setCurrentFields(fields);
      setGroupedFields(grouped);
    }
  }, [selectedCategory, categories]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ success: boolean; data: any }>(`/products/${id}`);
      
      if (response.success && response.data) {
        const product = response.data;
        
        // Set category - match by ID first, then by slug if it's a slug-based categoryId
        const productCategoryId = product.categoryId || 'general';
        const matchedCategory = categories.find(c => 
          c.id === productCategoryId || c.slug === productCategoryId
        );
        setSelectedCategory(matchedCategory?.id || productCategoryId);
        
        // Parse images
        let images: string[] = [];
        if (typeof product.images === 'string') {
          try {
            images = JSON.parse(product.images);
          } catch {
            images = product.images ? [product.images] : [];
          }
        } else if (Array.isArray(product.images)) {
          images = product.images;
        }
        setExistingImages(images);
        
        // Parse dynamic fields
        let dynamicData: Record<string, any> = {};
        if (product.dynamicFields) {
          try {
            dynamicData = typeof product.dynamicFields === 'string' 
              ? JSON.parse(product.dynamicFields) 
              : product.dynamicFields;
          } catch {
            dynamicData = {};
          }
        }
        
        // Combine all fields into formData
        setFormData({
          title: product.title || product.productName || '',
          productName: product.productName || product.title || '',
          description: product.description || '',
          price: product.price || 0,
          originalPrice: product.originalPrice || '',
          brand: product.brand || '',
          condition: product.condition || 'new',
          location: product.location || '',
          locationCity: product.locationCity || '',
          locationState: product.locationState || '',
          // Spread dynamic fields
          ...dynamicData,
          // Keep existing images as URLs (not File objects)
          images: images
        });
      } else {
        toast.error('Product not found');
        navigate('/seller/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
      navigate('/seller/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    currentFields.forEach(field => {
      const value = formData[field.name];
      
      // Check required fields (except images which might have existing URLs)
      if (field.required && field.name !== 'images') {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors[field.name] = `${field.label} is required`;
          isValid = false;
        }
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
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      toast.error('Please login to update product');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle images - separate new files from existing URLs
      let imageUrls = [...existingImages];
      const newFiles = (formData.images || []).filter((img: any) => img instanceof File);
      
      // Upload new images if any
      if (newFiles.length > 0) {
        const { uploadService } = await import('@/services/uploadService');
        const uploadResult = await uploadService.uploadMultiple(newFiles, 'products');
        
        if (uploadResult.data) {
          imageUrls = [...imageUrls, ...uploadResult.data.map(img => img.url)];
        }
      }
      
      // Prepare update data
      const updateData = {
        ...formData,
        images: imageUrls,
        categoryId: selectedCategory
      };
      
      // Call update API
      const response = await apiClient.put<{ success: boolean; data: any }>(`/products/${id}`, updateData);
      
      if (response.success) {
        toast.success('Product updated successfully!');
        setTimeout(() => {
          navigate('/seller/products');
        }, 1500);
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <FormLayout
        title="Edit Product"
        subtitle="Loading product data..."
        backUrl="/seller/products"
        backLabel="Back to Products"
        canSave={false}
      >
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="Edit Product"
      subtitle="Update your product listing"
      backUrl="/seller/products"
      backLabel="Back to Products"
      onSave={handleSubmit}
      isSaving={isSubmitting}
      canSave={!!selectedCategory}
    >
      {/* Category Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
            Product Category
          </CardTitle>
          <CardDescription>
            Category determines the available fields for this product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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

      {/* Existing Images Preview */}
      {existingImages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Images</CardTitle>
            <CardDescription>These images are already uploaded for this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCategory && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                    {groupKey === 'media' && 'Add new product images'}
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
                          field={{
                            ...field,
                            // Make images not required in edit mode since we have existing images
                            required: field.name === 'images' ? false : field.required
                          }}
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

export default EditProduct;
