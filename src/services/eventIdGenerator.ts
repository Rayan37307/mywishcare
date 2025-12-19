// services/eventIdGenerator.ts
// Centralized service for generating consistent event IDs for Meta Pixel tracking

// Generate a consistent event ID that can be used across client and server tracking
export class EventIdGenerator {
  private static instance: EventIdGenerator;
  private static readonly EVENT_ID_PREFIX = 'mpevt';

  // Singleton pattern to ensure consistent ID generation
  public static getInstance(): EventIdGenerator {
    if (!EventIdGenerator.instance) {
      EventIdGenerator.instance = new EventIdGenerator();
    }
    return EventIdGenerator.instance;
  }

  // Generate an event ID that's consistent between client and server
  generateEventId(eventName: string): string {
    // Create a unique ID based on event name and timestamp
    // Format: mpevt_eventName_timestamp_randomString
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    
    // Use only alphanumeric characters and underscores for compliance with Meta Pixel
    const eventNameClean = eventName.replace(/[^a-zA-Z0-9_]/g, '_');
    
    return `${EventIdGenerator.EVENT_ID_PREFIX}_${eventNameClean}_${timestamp}_${randomString}`;
  }

  // Generate an event ID with additional parameters for more uniqueness
  generateEventIdWithParams(eventName: string, params?: Record<string, any>): string {
    const baseId = this.generateEventId(eventName);
    
    if (params) {
      // Create a hash-like string from the parameters to add to the ID
      const paramHash = this.getParamsHash(params);
      return `${baseId}_${paramHash}`;
    }
    
    return baseId;
  }

  // Create a hash-like string from parameters for more uniqueness
  private getParamsHash(params: Record<string, any>): string {
    // Sort keys to ensure consistent hash regardless of parameter order
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map(key => `${key}:${params[key]}`).join('|');
    
    // Simple hash function to convert string to a short identifier
    let hash = 0;
    for (let i = 0; i < paramString.length; i++) {
      const char = paramString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive hexadecimal string and take first 8 chars
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  // Validate if an event ID follows our format
  isValidEventId(eventId: string): boolean {
    const regex = new RegExp(`^${EventIdGenerator.EVENT_ID_PREFIX}_[a-zA-Z0-9_]+_\\d+_[a-z0-9]{9}(_[a-f0-9]{8})?$`);
    return regex.test(eventId);
  }
}

// Create global instance
export const eventIdGenerator = EventIdGenerator.getInstance();

// Export the main function as a convenient helper
export const generateEventId = (eventName: string, params?: Record<string, any>): string => {
  return eventIdGenerator.generateEventIdWithParams(eventName, params);
};

// Export function to validate event IDs
export const isValidEventId = (eventId: string): boolean => {
  return eventIdGenerator.isValidEventId(eventId);
};