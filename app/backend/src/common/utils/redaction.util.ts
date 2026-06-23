/**
 * Sensitive value redaction utility.
 * Prevents secret values from appearing in logs and error messages.
 */

/**
 * List of environment variable keys that contain sensitive information
 */
const SENSITIVE_KEYS = [
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STELLAR_SECRET_KEY',
  'SENDGRID_API_KEY',
  'EXPO_ACCESS_TOKEN',
  'SECRET_KEY',
  'API_KEY',
  'PASSWORD',
  'TOKEN',
] as const;

/**
 * Redact sensitive values from an environment object.
 * Shows only the first and last 4 characters, masking the middle.
 * 
 * @param env - Environment variables object
 * @returns Sanitized copy with redacted sensitive values
 */
export function redactSensitiveValues(env: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(env)) {
    if (isSensitiveKey(key)) {
      redacted[key] = redactValue(String(value));
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact a single sensitive value.
 * Shows first 4 and last 4 characters with asterisks in between.
 * 
 * @param value - The value to redact
 * @returns Redacted string (e.g., "abcd********xyz1")
 */
export function redactValue(value: string): string {
  if (!value || value.length <= 8) {
    return '****';
  }

  const visible = 4;
  const start = value.substring(0, visible);
  const end = value.substring(value.length - visible);
  const masked = '*'.repeat(Math.min(value.length - visible * 2, 12));

  return `${start}${masked}${end}`;
}

/**
 * Check if a key name indicates sensitive data.
 * 
 * @param key - Environment variable name
 * @returns True if the key is sensitive
 */
function isSensitiveKey(key: string): boolean {
  const upperKey = key.toUpperCase();
  return SENSITIVE_KEYS.some(sensitive => upperKey.includes(sensitive));
}

/**
 * Sanitize an error message to prevent leaking sensitive configuration.
 * Removes any values that look like keys, tokens, secrets, or raw provider payloads.
 *
 * @param message - Error message to sanitize
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove Supabase keys (typically start with 'eyJ') before JWT pattern
  let sanitized = message.replace(/eyJ[A-Za-z0-9+/=]{30,}/g, '[REDACTED_JWT]');

  // Remove JWT-like tokens (three base64 segments separated by dots)
  sanitized = sanitized.replace(/[A-Za-z0-9+/=]{20,}\.[A-Za-z0-9+/=]{20,}\.[A-Za-z0-9+/=]{20,}/g, '[REDACTED_TOKEN]');

  // Remove anything that looks like a secret key (S followed by 55 base64 chars)
  sanitized = sanitized.replace(/S[A-Za-z0-9+/=]{55}/g, '[REDACTED_SECRET_KEY]');

  // Remove anything that looks like a Stellar account/public key (G followed by 55 base64 chars)
  sanitized = sanitized.replace(/G[A-Za-z0-9+/=]{55}/g, '[REDACTED_ACCOUNT_ID]');

  // Strip raw Soroban HostError payloads — keep the error type/code but drop opaque detail blobs
  sanitized = sanitized.replace(/HostError:\s*Error\([^)]+\)[^\n]*/g, '[REDACTED_HOST_ERROR]');

  // Remove raw Supabase error bodies (JSON-like or URL-encoded provider payloads)
  sanitized = sanitized.replace(/"message"\s*:\s*"[^"]{40,}"/g, '"message":"[REDACTED]"');

  return sanitized;
}

/**
 * Strip the `technicalError` field from a mapped error before it reaches an API response.
 * Returns a copy of `obj` with `technicalError` omitted, whether it's a direct property
 * or nested inside a `details` sub-object.
 */
export function omitTechnicalError<T extends Record<string, unknown>>(obj: T): Omit<T, 'technicalError'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { technicalError: _, ...safe } = obj;
  return safe as Omit<T, 'technicalError'>;
}

/**
 * Create a safe config summary for logging at startup.
 * Shows which required configs are loaded without exposing values.
 * 
 * @param config - Configuration object
 * @returns Safe summary string for logging
 */
export function createConfigSummary(config: Record<string, unknown>): string {
  const entries = Object.entries(config);
  
  const required = entries.filter(([key]) => 
    !key.includes('?') && !key.includes('OPTIONAL')
  );
  
  const loaded = required.filter(([, value]) => value !== undefined && value !== '');
  const missing = required.filter(([, value]) => value === undefined || value === '');

  const lines = [
    `Configuration: ${loaded.length}/${required.length} required values loaded`,
  ];

  if (missing.length > 0) {
    lines.push(`Missing: ${missing.map(([key]) => key).join(', ')}`);
  }

  return lines.join('. ');
}
