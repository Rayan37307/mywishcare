/**
 * Utility functions for analytics event tracking
 */

/**
 * Generate a consistent event ID that can be used for both client-side and server-side tracking
 * @param eventName The name of the event (e.g., 'ViewContent', 'AddToCart', etc.)
 * @param uniqueIdentifier A unique identifier for the specific action (e.g., product ID, order ID)
 * @param userId Optional user ID to create user-specific event IDs
 * @returns A consistent event ID string
 */
export function generateConsistentEventId(eventName: string, uniqueIdentifier: string | number, userId?: string | number): string {
  // Create a deterministic event ID based on event name, unique identifier, and optionally user ID
  // This ensures a consistent ID pattern for the same user doing the same action
  const userPart = userId ? `_${userId}` : '';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 5); // Shorter random suffix for readability
  return `${eventName}${userPart}_${uniqueIdentifier}_${timestamp}_${randomSuffix}`;
}

/**
 * Generate a user-specific event ID for tracking events related to a specific user
 * @param eventName The name of the event (e.g., 'ViewContent', 'AddToCart', etc.)
 * @param userId User ID to tie the event to a specific user
 * @returns A user-specific event ID string
 */
export function generateUserEventId(eventName: string, userId: string | number): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 5);
  return `${eventName}_user_${userId}_${timestamp}_${randomSuffix}`;
}

/**
 * Generate a hash-based event ID that's consistent for the same user and action within a time window
 * @param eventName The name of the event
 * @param uniqueIdentifier A unique identifier for the specific action
 * @param userId Optional user ID to make it user-specific
 * @param timeWindow Optional time window in milliseconds to make the ID consistent (default: 1 hour)
 * @returns A hash-based event ID that remains consistent within the time window
 */
export function generateConsistentHashEventId(eventName: string, uniqueIdentifier: string | number, userId?: string | number, timeWindow: number = 60 * 60 * 1000): string { // 1 hour default
  // Create a time-based window to keep the same ID consistent for a period
  const timeSlot = Math.floor(Date.now() / timeWindow);
  const baseString = `${eventName}_${uniqueIdentifier}_${userId || 'anonymous'}_${timeSlot}`;

  // Simple hash function to create consistent but unique IDs
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hashString = Math.abs(hash).toString(36);

  return `${eventName}_${uniqueIdentifier}_${userId || 'anonymous'}_${timeSlot.toString(36)}_${hashString}`;
}

/**
 * Generate a general event ID for events without a specific unique identifier
 * @param eventName The name of the event
 * @returns A consistent event ID string
 */
export function generateEventId(eventName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `${eventName}_${timestamp}_${randomSuffix}`;
}

/**
 * Alternative function to generate a completely unique event ID
 * @returns A unique event ID string
 */
export function generateUniqueEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}