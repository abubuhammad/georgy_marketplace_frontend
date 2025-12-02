/**
 * Utility functions for handling product images in various formats
 */

// Image can come in different formats from the API
type ImageFormat = 
  | string 
  | { image_url: string } 
  | { imageUrl: string } 
  | { url: string } 
  | { src: string };

/**
 * Get the first image URL from a product's images array
 * Handles multiple formats: string[], {image_url}[], {imageUrl}[], JSON string
 */
export function getProductImageUrl(images: any, fallback: string = '/placeholder-product.png'): string {
  if (!images) return fallback;

  // If it's a JSON string, try to parse it
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      // It might be a single URL string
      return images || fallback;
    }
  }

  // If it's not an array, return fallback
  if (!Array.isArray(images)) return fallback;

  // If array is empty, return fallback
  if (images.length === 0) return fallback;

  const firstImage = images[0];

  // If it's a string, return it directly
  if (typeof firstImage === 'string') {
    return firstImage || fallback;
  }

  // If it's an object, try various property names
  if (typeof firstImage === 'object' && firstImage !== null) {
    return (
      firstImage.image_url ||
      firstImage.imageUrl ||
      firstImage.url ||
      firstImage.src ||
      fallback
    );
  }

  return fallback;
}

/**
 * Get all image URLs from a product's images array
 * Returns normalized array of URL strings
 */
export function getAllProductImageUrls(images: any): string[] {
  if (!images) return [];

  // If it's a JSON string, try to parse it
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      // It might be a single URL string
      return images ? [images] : [];
    }
  }

  // If it's not an array, return empty
  if (!Array.isArray(images)) return [];

  return images.map((img: any) => {
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img !== null) {
      return img.image_url || img.imageUrl || img.url || img.src || '';
    }
    return '';
  }).filter(Boolean);
}

/**
 * Normalize images array to consistent format
 * Returns array of { image_url: string } objects
 */
export function normalizeProductImages(images: any): { image_url: string }[] {
  const urls = getAllProductImageUrls(images);
  return urls.map(url => ({ image_url: url }));
}

export default {
  getProductImageUrl,
  getAllProductImageUrls,
  normalizeProductImages
};
