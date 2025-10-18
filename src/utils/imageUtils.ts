// src/utils/imageUtils.ts
import type { Product } from '../types/product';

/**
 * Fetches the image URL for a given WordPress attachment ID
 * @param id The attachment ID
 * @returns The image URL or null if not found
 */
export const getImageUrlFromId = async (id: number): Promise<string | null> => {
  try {
    // Get the base URL from the environment variable
    const baseURL = import.meta.env.VITE_WC_API_URL || 'https://your-wordpress-site.com/wp-json/wc/v3';
    
    // Extract the actual site URL from the API URL
    const siteURL = baseURL.replace('/wp-json/wc/v3', '');
    
    // Fetch the attachment details
    const response = await fetch(`${siteURL}/wp-json/wp/v2/media/${id}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const media = await response.json();
    return media.source_url || null;
  } catch (error) {
    console.error(`Error fetching image with ID ${id}:`, error);
    return null;
  }
};

/**
 * Fetches multiple image URLs from attachment IDs
 * @param ids Array of attachment IDs
 * @returns Array of image URLs
 */
export const getImageUrlsFromIds = async (ids: number[]): Promise<string[]> => {
  if (!ids || ids.length === 0) return [];
  
  const urls = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getImageUrlFromId(id);
      } catch (error) {
        console.error(`Error fetching image with ID ${id}:`, error);
        return null;
      }
    })
  );
  
  return urls.filter((url): url is string => url !== null);
};