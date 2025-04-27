import { Timestamp } from 'firebase/firestore';

/**
 * Type guard to check if a value is a Firestore Timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return value instanceof Timestamp;
}

/**
 * Type guard to check if a value is a JavaScript Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Converts a value to a Firestore Timestamp
 * @param value Date or Timestamp to convert
 * @returns Firestore Timestamp
 */
export function toTimestamp(value: Date | Timestamp): Timestamp {
  if (isTimestamp(value)) {
    return value;
  }
  return Timestamp.fromDate(value);
}

/**
 * Converts a value to a JavaScript Date
 * @param value Date or Timestamp to convert
 * @returns JavaScript Date
 */
export function toDate(value: Date | Timestamp): Date {
  if (isDate(value)) {
    return value;
  }
  return value.toDate();
}

/**
 * Gets a nested value from an object using a dot-notation path
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((current, key) => current?.[key], obj as any);
}

/**
 * Sets a nested value in an object using a dot-notation path
 */
function setNestedValue<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj as any);
  target[lastKey] = value;
  return obj;
}

/**
 * Converts an object with Date/Timestamp fields to use Timestamps
 * @param obj Object to convert
 * @param datePaths Array of dot-notation paths to fields that should be converted to Timestamps
 * @returns Object with specified fields converted to Timestamps
 */
export function convertToTimestamps<T extends Record<string, any>>(
  obj: T,
  datePaths: string[]
): T {
  const result = { ...obj };
  datePaths.forEach(path => {
    const value = getNestedValue(result, path);
    if (value && (isDate(value) || isTimestamp(value))) {
      setNestedValue(result, path, toTimestamp(value));
    }
  });
  return result;
}

/**
 * Converts an object with Date/Timestamp fields to use Dates
 * @param obj Object to convert
 * @param datePaths Array of dot-notation paths to fields that should be converted to Dates
 * @returns Object with specified fields converted to Dates
 */
export function convertToDates<T extends Record<string, any>>(
  obj: T,
  datePaths: string[]
): T {
  const result = { ...obj };
  datePaths.forEach(path => {
    const value = getNestedValue(result, path);
    if (value && (isDate(value) || isTimestamp(value))) {
      setNestedValue(result, path, toDate(value));
    }
  });
  return result;
} 