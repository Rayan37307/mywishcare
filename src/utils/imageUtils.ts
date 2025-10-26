// src/utils/imageUtils.ts

/**
 * Fetches the image URL for a given WordPress attachment ID
 * @param id The attachment ID
 * @returns The image URL or null if not found
 */
// Get the proper API base URL for media
const getMediaApiUrl = (endpoint: string): string => {
  const envApiUrl = import.meta.env.VITE_WP_API_URL || '/wp-json';
  
  // Ensure the URL ends with /wp-json
  let baseUrl = envApiUrl;
  if (!baseUrl.includes('/wp-json')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}wp-json` : `${baseUrl}/wp-json`;
  }
  
  return `${baseUrl}${endpoint}`;
};

export const getImageUrlFromId = async (id: number): Promise<string | null> => {
  try {
    // Fetch the attachment details using the proper API URL
    const response = await fetch(getMediaApiUrl(`/wp/v2/media/${id}`));
    
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