import { DEFAULT_SANITIZE_CONFIG, type SanitizeConfig } from './config';

const REDACTED = '[REDACTED]';

export class Sanitizer {
  private headerKeys: Set<string>;
  private bodyKeys: Set<string>;

  constructor(config?: Partial<SanitizeConfig>) {
    const merged = {
      headers: [...DEFAULT_SANITIZE_CONFIG.headers, ...(config?.headers ?? [])],
      bodyKeys: [...DEFAULT_SANITIZE_CONFIG.bodyKeys, ...(config?.bodyKeys ?? [])],
    };
    this.headerKeys = new Set(merged.headers.map((k) => k.toLowerCase()));
    this.bodyKeys = new Set(merged.bodyKeys.map((k) => k.toLowerCase()));
  }

  sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      result[key] = this.headerKeys.has(key.toLowerCase()) ? REDACTED : value;
    }
    return result;
  }

  sanitizeBody(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitizeBody(item));

    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (this.bodyKeys.has(key.toLowerCase())) {
          result[key] = REDACTED;
        } else if (typeof value === 'object' && value !== null) {
          result[key] = this.sanitizeBody(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    }

    return obj;
  }
}
