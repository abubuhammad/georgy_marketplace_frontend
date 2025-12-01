export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'file' | 'checkbox' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  description?: string;
  group?: string;
}

export interface CategoryFieldConfig {
  categoryId: string;
  categoryName: string;
  fields: FieldConfig[];
}

// Electronics category fields (phones, computers, etc.)
const electronicsFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Product Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., iPhone 15 Pro Max 256GB',
    group: 'basic'
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'select',
    required: true,
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'google', label: 'Google' },
      { value: 'oneplus', label: 'OnePlus' },
      { value: 'xiaomi', label: 'Xiaomi' },
      { value: 'huawei', label: 'Huawei' },
      { value: 'dell', label: 'Dell' },
      { value: 'hp', label: 'HP' },
      { value: 'lenovo', label: 'Lenovo' },
      { value: 'asus', label: 'ASUS' },
      { value: 'acer', label: 'Acer' },
      { value: 'microsoft', label: 'Microsoft' },
      { value: 'other', label: 'Other' }
    ],
    group: 'basic'
  },
  {
    name: 'model',
    label: 'Model',
    type: 'text',
    required: true,
    placeholder: 'e.g., iPhone 15 Pro Max, MacBook Pro M3',
    group: 'basic'
  },
  {
    name: 'storage',
    label: 'Storage/RAM',
    type: 'text',
    required: false,
    placeholder: 'e.g., 256GB Storage, 16GB RAM',
    group: 'specifications'
  },
  {
    name: 'display',
    label: 'Display',
    type: 'text',
    required: false,
    placeholder: 'e.g., 6.7-inch Super Retina XDR, 14-inch Liquid Retina XDR',
    group: 'specifications'
  },
  {
    name: 'camera',
    label: 'Camera Specs',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., Triple 48MP camera system with telephoto, wide, and ultra-wide',
    group: 'specifications'
  },
  {
    name: 'battery',
    label: 'Battery',
    type: 'text',
    required: false,
    placeholder: 'e.g., Up to 29 hours video playback, 4500mAh',
    group: 'specifications'
  },
  {
    name: 'processor',
    label: 'Processor',
    type: 'text',
    required: false,
    placeholder: 'e.g., A17 Pro chip, M3 Pro chip',
    group: 'specifications'
  },
  {
    name: 'connectivity',
    label: 'Connectivity Features',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., 5G, Wi-Fi 6E, Bluetooth 5.3, USB-C',
    group: 'specifications'
  },
  {
    name: 'otherFeatures',
    label: 'Other Features',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., Face ID, Action Button, Dynamic Island',
    group: 'specifications'
  },
  {
    name: 'inBoxAccessories',
    label: 'In-box Accessories',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., USB-C to Lightning Cable, Documentation',
    group: 'accessories'
  },
  {
    name: 'warranty',
    label: 'Warranty',
    type: 'select',
    required: false,
    options: [
      { value: 'no-warranty', label: 'No Warranty' },
      { value: '3-months', label: '3 Months' },
      { value: '6-months', label: '6 Months' },
      { value: '1-year', label: '1 Year' },
      { value: '2-years', label: '2 Years' },
      { value: '3-years', label: '3 Years' }
    ],
    group: 'accessories'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'like-new', label: 'Like New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    group: 'basic'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '450000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the product...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Product Images',
    type: 'file',
    required: true,
    description: 'Upload up to 5 high-quality images of your product',
    group: 'media'
  }
];

// Groceries category fields
const groceriesFields: FieldConfig[] = [
  {
    name: 'productName',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Organic Basmati Rice',
    group: 'basic'
  },
  {
    name: 'category',
    label: 'Sub-Category',
    type: 'select',
    required: true,
    options: [
      { value: 'grains-cereals', label: 'Grains & Cereals' },
      { value: 'fruits-vegetables', label: 'Fruits & Vegetables' },
      { value: 'dairy-eggs', label: 'Dairy & Eggs' },
      { value: 'meat-seafood', label: 'Meat & Seafood' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'snacks', label: 'Snacks' },
      { value: 'condiments-spices', label: 'Condiments & Spices' },
      { value: 'frozen-foods', label: 'Frozen Foods' },
      { value: 'pantry-staples', label: 'Pantry Staples' },
      { value: 'organic', label: 'Organic Products' }
    ],
    group: 'basic'
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'text',
    required: false,
    placeholder: 'e.g., Golden Penny, Dangote, Peak',
    group: 'basic'
  },
  {
    name: 'netWeight',
    label: 'Net Weight',
    type: 'text',
    required: true,
    placeholder: 'e.g., 50kg, 1.5L, 250g',
    group: 'specifications'
  },
  {
    name: 'unit',
    label: 'Unit',
    type: 'select',
    required: true,
    options: [
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'g', label: 'Gram (g)' },
      { value: 'L', label: 'Liter (L)' },
      { value: 'ml', label: 'Milliliter (ml)' },
      { value: 'piece', label: 'Piece' },
      { value: 'pack', label: 'Pack' },
      { value: 'dozen', label: 'Dozen' },
      { value: 'carton', label: 'Carton' }
    ],
    group: 'specifications'
  },
  {
    name: 'packagingType',
    label: 'Packaging Type',
    type: 'select',
    required: false,
    options: [
      { value: 'bag', label: 'Bag' },
      { value: 'basket', label: 'Basket' },
      { value: 'bottle', label: 'Bottle' },
      { value: 'can', label: 'Can' },
      { value: 'box', label: 'Box' },
      { value: 'crate', label: 'Crate' },
      { value: 'sachet', label: 'Sachet' },
      { value: 'jar', label: 'Jar' },
      { value: 'container', label: 'Container' },
      { value: 'wrapper', label: 'Wrapper' },
      { value: 'bunch', label: 'Bunch' },
      { value: 'loose', label: 'Loose/Unpackaged' }
    ],
    group: 'specifications'
  },
  {
    name: 'ingredients',
    label: 'Ingredients',
    type: 'textarea',
    required: false,
    placeholder: 'List main ingredients...',
    group: 'details'
  },
  {
    name: 'nutritionFacts',
    label: 'Nutrition Facts',
    type: 'textarea',
    required: false,
    placeholder: 'Calories, protein, carbs, fats per serving...',
    group: 'details'
  },
  {
    name: 'allergenInfo',
    label: 'Allergen Information',
    type: 'textarea',
    required: false,
    placeholder: 'Contains: nuts, gluten, dairy, etc.',
    group: 'details'
  },
  {
    name: 'origin',
    label: 'Origin/Source Region',
    type: 'text',
    required: false,
    placeholder: 'e.g., Kebbi State, Nigeria, Thailand',
    group: 'details'
  },
  {
    name: 'grade',
    label: 'Grade/Quality',
    type: 'select',
    required: false,
    options: [
      { value: 'premium', label: 'Premium' },
      { value: 'grade-a', label: 'Grade A' },
      { value: 'grade-b', label: 'Grade B' },
      { value: 'standard', label: 'Standard' },
      { value: 'organic', label: 'Organic' }
    ],
    group: 'details'
  },
  {
    name: 'processingType',
    label: 'Processing Type',
    type: 'select',
    required: false,
    options: [
      { value: 'refined', label: 'Refined' },
      { value: 'unrefined', label: 'Unrefined' },
      { value: 'cold-pressed', label: 'Cold-pressed' },
      { value: 'raw', label: 'Raw' },
      { value: 'processed', label: 'Processed' },
      { value: 'natural', label: 'Natural' }
    ],
    group: 'details'
  },
  {
    name: 'shelfLife',
    label: 'Shelf Life/Best Before Date',
    type: 'text',
    required: false,
    placeholder: 'e.g., 12 months, 2025-12-31',
    group: 'storage'
  },
  {
    name: 'storageInstructions',
    label: 'Storage Instructions',
    type: 'textarea',
    required: false,
    placeholder: 'Store in cool, dry place. Keep refrigerated after opening.',
    group: 'storage'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '5000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'stockQuantity',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: '100',
    validation: {
      min: 0,
      message: 'Stock quantity cannot be negative'
    },
    group: 'pricing'
  },
  {
    name: 'minimumOrderQuantity',
    label: 'Minimum Order Quantity',
    type: 'number',
    required: false,
    placeholder: '1',
    validation: {
      min: 1,
      message: 'Minimum order quantity must be at least 1'
    },
    group: 'pricing'
  },
  {
    name: 'discountPrice',
    label: 'Discount Price (₦)',
    type: 'number',
    required: false,
    placeholder: '4500',
    validation: {
      min: 0,
      message: 'Discount price cannot be negative'
    },
    group: 'pricing'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the product...',
    group: 'basic'
  },
  {
    name: 'features',
    label: 'Features/Highlights',
    type: 'textarea',
    required: false,
    placeholder: 'Key features and selling points...',
    group: 'basic'
  },
  {
    name: 'sku',
    label: 'SKU/Product Code',
    type: 'text',
    required: false,
    placeholder: 'e.g., GRO-001, RICE-BAS-50KG',
    group: 'inventory'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'organic, basmati, premium, healthy',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'deliveryNotes',
    label: 'Delivery Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Special delivery instructions or notes...',
    group: 'delivery'
  },
  {
    name: 'seasonalAvailability',
    label: 'Seasonal Availability',
    type: 'text',
    required: false,
    placeholder: 'e.g., Available all year, Seasonal (Dec-Mar)',
    group: 'delivery'
  },
  {
    name: 'images',
    label: 'Product Images',
    type: 'file',
    required: true,
    description: 'Upload up to 5 high-quality images of your product',
    group: 'media'
  }
];

// Fashion & Beauty category fields
const fashionFields: FieldConfig[] = [
  {
    name: 'productName',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Men\'s Casual Cotton Shirt',
    group: 'basic'
  },
  {
    name: 'category',
    label: 'Sub-Category',
    type: 'select',
    required: true,
    options: [
      { value: 'clothing', label: 'Clothing' },
      { value: 'footwear', label: 'Footwear' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'cosmetics', label: 'Cosmetics' },
      { value: 'skincare', label: 'Skincare' },
      { value: 'perfume', label: 'Perfume/Cologne' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'bags', label: 'Bags & Purses' },
      { value: 'watches', label: 'Watches' }
    ],
    group: 'basic'
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'text',
    required: false,
    placeholder: 'e.g., Nike, Zara, MAC, Loreal',
    group: 'basic'
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    required: true,
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'unisex', label: 'Unisex' },
      { value: 'kids-boys', label: 'Kids - Boys' },
      { value: 'kids-girls', label: 'Kids - Girls' }
    ],
    group: 'basic'
  },
  {
    name: 'sizesAvailable',
    label: 'Available Sizes',
    type: 'multiselect',
    required: false,
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: 'xxl', label: 'XXL' },
      { value: 'xxxl', label: 'XXXL' },
      { value: '36', label: '36' },
      { value: '38', label: '38' },
      { value: '40', label: '40' },
      { value: '42', label: '42' },
      { value: '44', label: '44' },
      { value: '46', label: '46' }
    ],
    group: 'specifications'
  },
  {
    name: 'colorsAvailable',
    label: 'Available Colors',
    type: 'text',
    required: true,
    placeholder: 'Black, White, Blue, Red, Pink',
    description: 'Separate colors with commas',
    group: 'specifications'
  },
  {
    name: 'material',
    label: 'Material/Fabric Type',
    type: 'text',
    required: false,
    placeholder: 'e.g., 100% Cotton, Polyester blend, Leather, Silk',
    group: 'specifications'
  },
  {
    name: 'pattern',
    label: 'Pattern/Design',
    type: 'text',
    required: false,
    placeholder: 'e.g., Solid, Striped, Floral, Polka dots',
    group: 'specifications'
  },
  {
    name: 'style',
    label: 'Style',
    type: 'select',
    required: false,
    options: [
      { value: 'casual', label: 'Casual' },
      { value: 'formal', label: 'Formal' },
      { value: 'streetwear', label: 'Streetwear' },
      { value: 'vintage', label: 'Vintage' },
      { value: 'contemporary', label: 'Contemporary' },
      { value: 'traditional', label: 'Traditional' }
    ],
    group: 'specifications'
  },
  {
    name: 'occasion',
    label: 'Occasion',
    type: 'select',
    required: false,
    options: [
      { value: 'party', label: 'Party' },
      { value: 'work', label: 'Work/Office' },
      { value: 'everyday', label: 'Everyday' },
      { value: 'wedding', label: 'Wedding' },
      { value: 'sports', label: 'Sports/Fitness' },
      { value: 'travel', label: 'Travel' }
    ],
    group: 'specifications'
  },
  {
    name: 'productWeight',
    label: 'Product Weight (g)',
    type: 'number',
    required: false,
    placeholder: '250',
    description: 'Weight in grams (for perfume, cosmetics etc.)',
    group: 'specifications'
  },
  {
    name: 'netVolume',
    label: 'Net Volume (ml)',
    type: 'number',
    required: false,
    placeholder: '50',
    description: 'Volume in ml (for creams, sprays, perfumes)',
    group: 'specifications'
  },
  {
    name: 'ingredients',
    label: 'Ingredients/Composition',
    type: 'textarea',
    required: false,
    placeholder: 'List main ingredients for beauty/cosmetic items...',
    description: 'For beauty and cosmetic products',
    group: 'details'
  },
  {
    name: 'allergenInfo',
    label: 'Allergen Information',
    type: 'textarea',
    required: false,
    placeholder: 'Contains: fragrance, sulfates, parabens...',
    group: 'details'
  },
  {
    name: 'fragranceType',
    label: 'Fragrance Type',
    type: 'select',
    required: false,
    options: [
      { value: 'floral', label: 'Floral' },
      { value: 'woody', label: 'Woody' },
      { value: 'fresh', label: 'Fresh' },
      { value: 'oriental', label: 'Oriental' },
      { value: 'citrus', label: 'Citrus' },
      { value: 'musky', label: 'Musky' }
    ],
    description: 'For perfumes and colognes',
    group: 'details'
  },
  {
    name: 'finish',
    label: 'Finish/Texture',
    type: 'select',
    required: false,
    options: [
      { value: 'matte', label: 'Matte' },
      { value: 'glossy', label: 'Glossy' },
      { value: 'satin', label: 'Satin' },
      { value: 'shimmer', label: 'Shimmer' },
      { value: 'creamy', label: 'Creamy' },
      { value: 'powder', label: 'Powder' }
    ],
    description: 'For makeup and cosmetic products',
    group: 'details'
  },
  {
    name: 'packagingType',
    label: 'Packaging Type',
    type: 'text',
    required: false,
    placeholder: 'e.g., Bottle, Tube, Compact, Box',
    group: 'details'
  },
  {
    name: 'shelfLife',
    label: 'Shelf Life/Expiry Date',
    type: 'text',
    required: false,
    placeholder: 'e.g., 24 months, 2025-12-31',
    description: 'For cosmetics and beauty products',
    group: 'storage'
  },
  {
    name: 'storageInstructions',
    label: 'Storage Instructions',
    type: 'textarea',
    required: false,
    placeholder: 'Store in cool, dry place. Keep away from direct sunlight.',
    group: 'storage'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'like-new', label: 'Like New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    group: 'basic'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '15000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'stockQuantity',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: '50',
    validation: {
      min: 0,
      message: 'Stock quantity cannot be negative'
    },
    group: 'pricing'
  },
  {
    name: 'minimumOrderQuantity',
    label: 'Minimum Order Quantity',
    type: 'number',
    required: false,
    placeholder: '1',
    validation: {
      min: 1,
      message: 'Minimum order quantity must be at least 1'
    },
    group: 'pricing'
  },
  {
    name: 'sku',
    label: 'SKU/Product Code',
    type: 'text',
    required: false,
    placeholder: 'e.g., FSH-001, SHIRT-BLU-L',
    group: 'inventory'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'organic, made in Nigeria, vegan, handmade',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the product...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Product Images',
    type: 'file',
    required: true,
    description: 'Upload up to 5 high-quality images of your product',
    group: 'media'
  }
];

// Home & Garden category fields
const homeGardenFields: FieldConfig[] = [
  {
    name: 'productName',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Wooden Dining Table, Garden Hose, Kitchen Knife Set',
    group: 'basic'
  },
  {
    name: 'category',
    label: 'Sub-Category',
    type: 'select',
    required: true,
    options: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'decor', label: 'Decor' },
      { value: 'garden-tools', label: 'Garden Tools' },
      { value: 'kitchenware', label: 'Kitchenware' },
      { value: 'bedding', label: 'Bedding' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'storage', label: 'Storage & Organization' },
      { value: 'appliances', label: 'Home Appliances' }
    ],
    group: 'basic'
  },
  {
    name: 'brand',
    label: 'Brand/Manufacturer',
    type: 'text',
    required: false,
    placeholder: 'e.g., IKEA, Samsung, Local Artisan',
    group: 'basic'
  },
  {
    name: 'material',
    label: 'Material',
    type: 'select',
    required: true,
    options: [
      { value: 'wood', label: 'Wood' },
      { value: 'metal', label: 'Metal' },
      { value: 'plastic', label: 'Plastic' },
      { value: 'fabric', label: 'Fabric' },
      { value: 'glass', label: 'Glass' },
      { value: 'ceramic', label: 'Ceramic' },
      { value: 'leather', label: 'Leather' },
      { value: 'bamboo', label: 'Bamboo' },
      { value: 'composite', label: 'Composite' }
    ],
    group: 'specifications'
  },
  {
    name: 'finish',
    label: 'Finish/Color',
    type: 'text',
    required: false,
    placeholder: 'e.g., Oak finish, Matte black, White painted',
    group: 'specifications'
  },
  {
    name: 'dimensions',
    label: 'Dimensions (L x W x H cm)',
    type: 'text',
    required: false,
    placeholder: 'e.g., 120 x 80 x 75',
    group: 'specifications'
  },
  {
    name: 'weight',
    label: 'Weight (kg)',
    type: 'number',
    required: false,
    placeholder: '25',
    group: 'specifications'
  },
  {
    name: 'capacity',
    label: 'Capacity',
    type: 'text',
    required: false,
    placeholder: 'e.g., 500ml, 6 seats, 50L',
    description: 'For containers, planters, seating etc.',
    group: 'specifications'
  },
  {
    name: 'roomUsage',
    label: 'Room/Intended Usage',
    type: 'multiselect',
    required: false,
    options: [
      { value: 'bedroom', label: 'Bedroom' },
      { value: 'living-room', label: 'Living Room' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'bathroom', label: 'Bathroom' },
      { value: 'dining-room', label: 'Dining Room' },
      { value: 'office', label: 'Office' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'garden', label: 'Garden' }
    ],
    group: 'specifications'
  },
  {
    name: 'style',
    label: 'Style',
    type: 'select',
    required: false,
    options: [
      { value: 'modern', label: 'Modern' },
      { value: 'rustic', label: 'Rustic' },
      { value: 'vintage', label: 'Vintage' },
      { value: 'contemporary', label: 'Contemporary' },
      { value: 'traditional', label: 'Traditional' },
      { value: 'minimalist', label: 'Minimalist' },
      { value: 'industrial', label: 'Industrial' }
    ],
    group: 'specifications'
  },
  {
    name: 'assemblyRequired',
    label: 'Assembly Required',
    type: 'select',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'partial', label: 'Partial Assembly' }
    ],
    group: 'details'
  },
  {
    name: 'careInstructions',
    label: 'Care/Cleaning Instructions',
    type: 'textarea',
    required: false,
    placeholder: 'Wipe with damp cloth. Avoid harsh chemicals...',
    group: 'details'
  },
  {
    name: 'warranty',
    label: 'Warranty/Guarantee',
    type: 'select',
    required: false,
    options: [
      { value: 'no-warranty', label: 'No Warranty' },
      { value: '6-months', label: '6 Months' },
      { value: '1-year', label: '1 Year' },
      { value: '2-years', label: '2 Years' },
      { value: '5-years', label: '5 Years' },
      { value: 'lifetime', label: 'Lifetime Warranty' }
    ],
    group: 'details'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'like-new', label: 'Like New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    group: 'basic'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '25000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'stockQuantity',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: '10',
    validation: {
      min: 0,
      message: 'Stock quantity cannot be negative'
    },
    group: 'pricing'
  },
  {
    name: 'deliveryNotes',
    label: 'Delivery Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Bulky item, requires assembly, fragile...',
    group: 'delivery'
  },
  {
    name: 'sku',
    label: 'SKU/Product Code',
    type: 'text',
    required: false,
    placeholder: 'e.g., HG-001, TABLE-WD-120',
    group: 'inventory'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'locally made, handcrafted, eco-friendly',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the product...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Product Images',
    type: 'file',
    required: true,
    description: 'Upload up to 5 high-quality images of your product',
    group: 'media'
  }
];

// Sports & Recreation category fields
const sportsFields: FieldConfig[] = [
  {
    name: 'productName',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., Nike Football Boots, Yoga Mat, Basketball',
    group: 'basic'
  },
  {
    name: 'category',
    label: 'Sub-Category',
    type: 'select',
    required: true,
    options: [
      { value: 'equipment', label: 'Equipment' },
      { value: 'apparel', label: 'Apparel' },
      { value: 'footwear', label: 'Footwear' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'gym', label: 'Gym & Fitness' },
      { value: 'team-sports', label: 'Team Sports' },
      { value: 'water-sports', label: 'Water Sports' }
    ],
    group: 'basic'
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'text',
    required: false,
    placeholder: 'e.g., Nike, Adidas, Wilson, Spalding',
    group: 'basic'
  },
  {
    name: 'material',
    label: 'Material/Build Quality',
    type: 'text',
    required: false,
    placeholder: 'e.g., Leather, Synthetic, Rubber, Steel',
    group: 'specifications'
  },
  {
    name: 'sizesAvailable',
    label: 'Available Sizes',
    type: 'multiselect',
    required: false,
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: '38', label: '38' },
      { value: '40', label: '40' },
      { value: '42', label: '42' },
      { value: '44', label: '44' },
      { value: '46', label: '46' },
      { value: 'one-size', label: 'One Size' }
    ],
    description: 'For apparel and footwear',
    group: 'specifications'
  },
  {
    name: 'weight',
    label: 'Weight (kg)',
    type: 'number',
    required: false,
    placeholder: '0.5',
    description: 'Product weight (if relevant for equipment)',
    group: 'specifications'
  },
  {
    name: 'dimensions',
    label: 'Dimensions (L x W x H cm)',
    type: 'text',
    required: false,
    placeholder: 'e.g., 70 x 24 x 0.6 (for yoga mat)',
    group: 'specifications'
  },
  {
    name: 'usageType',
    label: 'Usage Type',
    type: 'select',
    required: false,
    options: [
      { value: 'indoor', label: 'Indoor' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'both', label: 'Indoor/Outdoor' }
    ],
    group: 'specifications'
  },
  {
    name: 'sportType',
    label: 'Sport Type',
    type: 'select',
    required: false,
    options: [
      { value: 'football', label: 'Football' },
      { value: 'basketball', label: 'Basketball' },
      { value: 'tennis', label: 'Tennis' },
      { value: 'gym', label: 'Gym/Fitness' },
      { value: 'swimming', label: 'Swimming' },
      { value: 'running', label: 'Running' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'boxing', label: 'Boxing' },
      { value: 'yoga', label: 'Yoga' },
      { value: 'general', label: 'General Sports' }
    ],
    group: 'specifications'
  },
  {
    name: 'safetyCertifications',
    label: 'Safety Certifications',
    type: 'text',
    required: false,
    placeholder: 'e.g., FIFA approved, CE certified',
    description: 'If relevant for equipment',
    group: 'details'
  },
  {
    name: 'maintenanceInstructions',
    label: 'Maintenance Instructions',
    type: 'textarea',
    required: false,
    placeholder: 'Clean after use, store in dry place...',
    group: 'details'
  },
  {
    name: 'warranty',
    label: 'Warranty/Guarantee',
    type: 'select',
    required: false,
    options: [
      { value: 'no-warranty', label: 'No Warranty' },
      { value: '6-months', label: '6 Months' },
      { value: '1-year', label: '1 Year' },
      { value: '2-years', label: '2 Years' }
    ],
    group: 'details'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'like-new', label: 'Like New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    group: 'basic'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '8000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'stockQuantity',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: '20',
    validation: {
      min: 0,
      message: 'Stock quantity cannot be negative'
    },
    group: 'pricing'
  },
  {
    name: 'sku',
    label: 'SKU/Product Code',
    type: 'text',
    required: false,
    placeholder: 'e.g., SPT-001, BOOT-NK-42',
    group: 'inventory'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'durable, water-resistant, professional',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the product...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Product Images',
    type: 'file',
    required: true,
    description: 'Upload up to 5 high-quality images of your product',
    group: 'media'
  }
];

// Books & Education category fields
const booksFields: FieldConfig[] = [
  {
    name: 'bookTitle',
    label: 'Book Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., Things Fall Apart, Mathematics for JSS1',
    group: 'basic'
  },
  {
    name: 'author',
    label: 'Author',
    type: 'text',
    required: true,
    placeholder: 'e.g., Chinua Achebe, Prof. M.O. Adebayo',
    group: 'basic'
  },
  {
    name: 'publisher',
    label: 'Publisher',
    type: 'text',
    required: false,
    placeholder: 'e.g., Heinemann, Macmillan',
    group: 'basic'
  },
  {
    name: 'isbn',
    label: 'ISBN',
    type: 'text',
    required: false,
    placeholder: 'e.g., 978-0-123456-78-9',
    group: 'basic'
  },
  {
    name: 'edition',
    label: 'Edition',
    type: 'text',
    required: false,
    placeholder: 'e.g., 3rd Edition, Revised',
    group: 'basic'
  },
  {
    name: 'language',
    label: 'Language',
    type: 'select',
    required: true,
    options: [
      { value: 'english', label: 'English' },
      { value: 'yoruba', label: 'Yoruba' },
      { value: 'igbo', label: 'Igbo' },
      { value: 'hausa', label: 'Hausa' },
      { value: 'french', label: 'French' },
      { value: 'arabic', label: 'Arabic' }
    ],
    group: 'basic'
  },
  {
    name: 'numberOfPages',
    label: 'Number of Pages',
    type: 'number',
    required: false,
    placeholder: '250',
    group: 'specifications'
  },
  {
    name: 'publicationDate',
    label: 'Publication Date',
    type: 'date',
    required: false,
    group: 'specifications'
  },
  {
    name: 'format',
    label: 'Format',
    type: 'select',
    required: true,
    options: [
      { value: 'paperback', label: 'Paperback' },
      { value: 'hardcover', label: 'Hardcover' },
      { value: 'ebook', label: 'e-Book' },
      { value: 'audiobook', label: 'Audiobook' }
    ],
    group: 'specifications'
  },
  {
    name: 'subject',
    label: 'Subject/Genre',
    type: 'select',
    required: true,
    options: [
      { value: 'fiction', label: 'Fiction' },
      { value: 'non-fiction', label: 'Non-Fiction' },
      { value: 'academic', label: 'Academic' },
      { value: 'children', label: 'Children' },
      { value: 'textbook', label: 'Textbook' },
      { value: 'reference', label: 'Reference' },
      { value: 'biography', label: 'Biography' },
      { value: 'history', label: 'History' },
      { value: 'science', label: 'Science' },
      { value: 'mathematics', label: 'Mathematics' },
      { value: 'literature', label: 'Literature' },
      { value: 'religious', label: 'Religious' }
    ],
    group: 'basic'
  },
  {
    name: 'level',
    label: 'Educational Level',
    type: 'select',
    required: false,
    options: [
      { value: 'primary', label: 'Primary' },
      { value: 'secondary', label: 'Secondary/High School' },
      { value: 'tertiary', label: 'Tertiary/University' },
      { value: 'professional', label: 'Professional' },
      { value: 'general', label: 'General Reading' }
    ],
    group: 'specifications'
  },
  {
    name: 'ageGroup',
    label: 'Age Group',
    type: 'select',
    required: false,
    options: [
      { value: '0-5', label: '0-5 years' },
      { value: '6-10', label: '6-10 years' },
      { value: '11-15', label: '11-15 years' },
      { value: '16-18', label: '16-18 years' },
      { value: '18+', label: '18+ years' }
    ],
    description: 'For children\'s books',
    group: 'specifications'
  },
  {
    name: 'dimensions',
    label: 'Dimensions (H x W cm)',
    type: 'text',
    required: false,
    placeholder: 'e.g., 24 x 16',
    group: 'specifications'
  },
  {
    name: 'weight',
    label: 'Weight (g)',
    type: 'number',
    required: false,
    placeholder: '300',
    description: 'For shipping calculations',
    group: 'specifications'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'like-new', label: 'Like New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    group: 'basic'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '2500',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'stockQuantity',
    label: 'Stock Quantity',
    type: 'number',
    required: true,
    placeholder: '15',
    validation: {
      min: 0,
      message: 'Stock quantity cannot be negative'
    },
    group: 'pricing'
  },
  {
    name: 'sku',
    label: 'ISBN/Product Code',
    type: 'text',
    required: false,
    placeholder: 'e.g., BK-001, ISBN-123456789',
    group: 'inventory'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'STEM, exam prep, local authors',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Book summary, what readers will learn...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Cover Photo/Images',
    type: 'file',
    required: true,
    description: 'Upload book cover and additional images',
    group: 'media'
  }
];

// Vehicles category fields
const vehiclesFields: FieldConfig[] = [
  {
    name: 'vehicleType',
    label: 'Vehicle Type',
    type: 'select',
    required: true,
    options: [
      { value: 'car', label: 'Car' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'truck', label: 'Truck' },
      { value: 'bus', label: 'Bus' },
      { value: 'suv', label: 'SUV' },
      { value: 'van', label: 'Van' },
      { value: 'bicycle', label: 'Bicycle' }
    ],
    group: 'basic'
  },
  {
    name: 'make',
    label: 'Make/Brand',
    type: 'select',
    required: true,
    options: [
      { value: 'toyota', label: 'Toyota' },
      { value: 'honda', label: 'Honda' },
      { value: 'mercedes', label: 'Mercedes-Benz' },
      { value: 'bmw', label: 'BMW' },
      { value: 'volkswagen', label: 'Volkswagen' },
      { value: 'peugeot', label: 'Peugeot' },
      { value: 'nissan', label: 'Nissan' },
      { value: 'hyundai', label: 'Hyundai' },
      { value: 'kia', label: 'Kia' },
      { value: 'other', label: 'Other' }
    ],
    group: 'basic'
  },
  {
    name: 'model',
    label: 'Model',
    type: 'text',
    required: true,
    placeholder: 'e.g., Camry, Corolla, C-Class',
    group: 'basic'
  },
  {
    name: 'yearOfManufacture',
    label: 'Year of Manufacture',
    type: 'number',
    required: true,
    placeholder: '2020',
    validation: {
      min: 1950,
      max: new Date().getFullYear() + 1,
      message: 'Enter a valid year'
    },
    group: 'basic'
  },
  {
    name: 'yearOfRegistration',
    label: 'Year of Registration',
    type: 'number',
    required: false,
    placeholder: '2021',
    description: 'If different from manufacture year',
    group: 'basic'
  },
  {
    name: 'mileage',
    label: 'Mileage/Kilometer Reading',
    type: 'number',
    required: true,
    placeholder: '45000',
    group: 'specifications'
  },
  {
    name: 'engineCapacity',
    label: 'Engine Capacity',
    type: 'text',
    required: false,
    placeholder: 'e.g., 2.5L, 1600cc',
    group: 'specifications'
  },
  {
    name: 'transmissionType',
    label: 'Transmission Type',
    type: 'select',
    required: true,
    options: [
      { value: 'manual', label: 'Manual' },
      { value: 'automatic', label: 'Automatic' },
      { value: 'cvt', label: 'CVT' }
    ],
    group: 'specifications'
  },
  {
    name: 'fuelType',
    label: 'Fuel Type',
    type: 'select',
    required: true,
    options: [
      { value: 'petrol', label: 'Petrol' },
      { value: 'diesel', label: 'Diesel' },
      { value: 'electric', label: 'Electric' },
      { value: 'hybrid', label: 'Hybrid' },
      { value: 'gas', label: 'Gas (CNG/LPG)' }
    ],
    group: 'specifications'
  },
  {
    name: 'exteriorColor',
    label: 'Exterior Color',
    type: 'text',
    required: true,
    placeholder: 'e.g., White, Black, Silver',
    group: 'specifications'
  },
  {
    name: 'interiorFeatures',
    label: 'Interior Features',
    type: 'textarea',
    required: false,
    placeholder: 'AC, Leather seats, Infotainment system...',
    group: 'details'
  },
  {
    name: 'bodyType',
    label: 'Body Type',
    type: 'select',
    required: false,
    options: [
      { value: 'sedan', label: 'Sedan' },
      { value: 'suv', label: 'SUV' },
      { value: 'hatchback', label: 'Hatchback' },
      { value: 'wagon', label: 'Wagon' },
      { value: 'coupe', label: 'Coupe' },
      { value: 'convertible', label: 'Convertible' },
      { value: 'pickup', label: 'Pickup' }
    ],
    group: 'specifications'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'certified-pre-owned', label: 'Certified Pre-Owned' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'needs-work', label: 'Needs Work' }
    ],
    group: 'basic'
  },
  {
    name: 'features',
    label: 'Features & Accessories',
    type: 'textarea',
    required: false,
    placeholder: 'Power steering, ABS, parking sensors, GPS...',
    group: 'details'
  },
  {
    name: 'numberOfOwners',
    label: 'Number of Previous Owners',
    type: 'number',
    required: false,
    placeholder: '1',
    description: 'For used vehicles',
    group: 'details'
  },
  {
    name: 'registrationStatus',
    label: 'Registration Status',
    type: 'select',
    required: true,
    options: [
      { value: 'registered', label: 'Registered' },
      { value: 'unregistered', label: 'Unregistered' },
      { value: 'custom-cleared', label: 'Custom Cleared' },
      { value: 'awaiting-clearance', label: 'Awaiting Clearance' }
    ],
    group: 'details'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '2500000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'location',
    label: 'Location (City, State)',
    type: 'text',
    required: true,
    placeholder: 'e.g., Lagos, Lagos State',
    group: 'basic'
  },
  {
    name: 'vehicleId',
    label: 'VIN/Chassis Number',
    type: 'text',
    required: false,
    placeholder: 'Last 6 digits for privacy',
    description: 'Vehicle identification number',
    group: 'inventory'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'low mileage, imported, foreign used, first owner',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the vehicle condition, history...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Vehicle Images',
    type: 'file',
    required: true,
    description: 'Upload exterior, interior, engine photos',
    group: 'media'
  }
];

// Services category fields
const servicesFields: FieldConfig[] = [
  {
    name: 'serviceName',
    label: 'Service Name',
    type: 'text',
    required: true,
    placeholder: 'e.g., House Cleaning, Web Design, Tutoring',
    group: 'basic'
  },
  {
    name: 'category',
    label: 'Service Category',
    type: 'select',
    required: true,
    options: [
      { value: 'cleaning', label: 'Cleaning' },
      { value: 'repair', label: 'Repair & Maintenance' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'education', label: 'Education & Tutoring' },
      { value: 'health', label: 'Health & Wellness' },
      { value: 'beauty', label: 'Beauty & Personal Care' },
      { value: 'technology', label: 'Technology' },
      { value: 'transportation', label: 'Transportation' },
      { value: 'event', label: 'Event Planning' },
      { value: 'creative', label: 'Creative Services' }
    ],
    group: 'basic'
  },
  {
    name: 'providerName',
    label: 'Service Provider Name',
    type: 'text',
    required: true,
    placeholder: 'Your name or company name',
    group: 'basic'
  },
  {
    name: 'serviceArea',
    label: 'Service Area/Location',
    type: 'text',
    required: true,
    placeholder: 'e.g., Lagos, Abuja, Nationwide',
    group: 'basic'
  },
  {
    name: 'priceType',
    label: 'Pricing Type',
    type: 'select',
    required: true,
    options: [
      { value: 'fixed', label: 'Fixed Price' },
      { value: 'hourly', label: 'Per Hour' },
      { value: 'daily', label: 'Per Day' },
      { value: 'project', label: 'Per Project' },
      { value: 'negotiable', label: 'Negotiable' }
    ],
    group: 'pricing'
  },
  {
    name: 'price',
    label: 'Price/Rate (₦)',
    type: 'number',
    required: true,
    placeholder: '5000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'availability',
    label: 'Availability',
    type: 'text',
    required: false,
    placeholder: 'Mon-Fri 9AM-5PM, Weekends available',
    group: 'details'
  },
  {
    name: 'durationEstimate',
    label: 'Duration Estimate',
    type: 'text',
    required: false,
    placeholder: '2-3 hours, 1 week, Same day',
    group: 'details'
  },
  {
    name: 'equipmentProvided',
    label: 'Equipment/Materials Provided',
    type: 'select',
    required: false,
    options: [
      { value: 'yes', label: 'Yes - Included' },
      { value: 'no', label: 'No - Client provides' },
      { value: 'partial', label: 'Partial - Some included' }
    ],
    group: 'details'
  },
  {
    name: 'certification',
    label: 'Certification/Licensing',
    type: 'text',
    required: false,
    placeholder: 'Professional certifications, licenses held',
    group: 'details'
  },
  {
    name: 'experience',
    label: 'Years of Experience',
    type: 'number',
    required: false,
    placeholder: '5',
    group: 'details'
  },
  {
    name: 'termsConditions',
    label: 'Terms & Conditions',
    type: 'textarea',
    required: false,
    placeholder: 'Payment terms, cancellation policy, guarantees...',
    group: 'details'
  },
  {
    name: 'cancellationPolicy',
    label: 'Cancellation Policy',
    type: 'textarea',
    required: false,
    placeholder: '24-hour notice required, 50% charge for late cancellations...',
    group: 'details'
  },
  {
    name: 'contactInfo',
    label: 'Contact Information',
    type: 'text',
    required: true,
    placeholder: 'Phone number, email',
    group: 'basic'
  },
  {
    name: 'tags',
    label: 'Tags/Keywords',
    type: 'text',
    required: false,
    placeholder: 'licensed, insured, fast response, local',
    description: 'Separate tags with commas',
    group: 'inventory'
  },
  {
    name: 'description',
    label: 'Service Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of your service, what\'s included...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Portfolio/Service Images',
    type: 'file',
    required: false,
    description: 'Upload portfolio images, before/after photos',
    group: 'media'
  }
];

// Default/General category fields
const generalFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Product Title',
    type: 'text',
    required: true,
    placeholder: 'Product title',
    group: 'basic'
  },
  {
    name: 'category',
    label: 'Sub-Category',
    type: 'text',
    required: false,
    placeholder: 'Specific category',
    group: 'basic'
  },
  {
    name: 'brand',
    label: 'Brand',
    type: 'text',
    required: false,
    placeholder: 'Brand name',
    group: 'basic'
  },
  {
    name: 'condition',
    label: 'Condition',
    type: 'select',
    required: true,
    options: [
      { value: 'new', label: 'Brand New' },
      { value: 'like-new', label: 'Like New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    group: 'basic'
  },
  {
    name: 'price',
    label: 'Price (₦)',
    type: 'number',
    required: true,
    placeholder: '10000',
    validation: {
      min: 1,
      message: 'Price must be greater than 0'
    },
    group: 'pricing'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Detailed description of the product...',
    group: 'basic'
  },
  {
    name: 'images',
    label: 'Product Images',
    type: 'file',
    required: true,
    description: 'Upload up to 5 high-quality images of your product',
    group: 'media'
  }
];

// Category configurations
export const categoryFieldConfigs: CategoryFieldConfig[] = [
  {
    categoryId: 'electronics',
    categoryName: 'Electronics',
    fields: electronicsFields
  },
  {
    categoryId: 'groceries',
    categoryName: 'Groceries',
    fields: groceriesFields
  },
  {
    categoryId: 'fashion',
    categoryName: 'Fashion & Beauty',
    fields: fashionFields
  },
  {
    categoryId: 'home',
    categoryName: 'Home & Garden',
    fields: homeGardenFields
  },
  {
    categoryId: 'sports',
    categoryName: 'Sports & Recreation',
    fields: sportsFields
  },
  {
    categoryId: 'books',
    categoryName: 'Books & Education',
    fields: booksFields
  },
  {
    categoryId: 'vehicles',
    categoryName: 'Vehicles',
    fields: vehiclesFields
  },
  {
    categoryId: 'services',
    categoryName: 'Services',
    fields: servicesFields
  },
  {
    categoryId: 'general',
    categoryName: 'General',
    fields: generalFields
  }
];

// Helper function to get fields for a specific category
export const getFieldsForCategory = (categoryId: string): FieldConfig[] => {
  const config = categoryFieldConfigs.find(c => c.categoryId === categoryId);
  return config?.fields || generalFields;
};

// Helper function to group fields
export const groupFields = (fields: FieldConfig[]): Record<string, FieldConfig[]> => {
  return fields.reduce((groups, field) => {
    const group = field.group || 'basic';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(field);
    return groups;
  }, {} as Record<string, FieldConfig[]>);
};

// Group labels for better organization
export const groupLabels: Record<string, string> = {
  basic: 'Basic Information',
  specifications: 'Specifications',
  details: 'Product Details',
  storage: 'Storage & Expiry',
  pricing: 'Pricing & Stock',
  inventory: 'Inventory Management',
  delivery: 'Delivery Information',
  accessories: 'Accessories & Warranty',
  media: 'Images & Media'
};