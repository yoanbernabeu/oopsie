import { describe, it, expect } from 'vitest';
import { Sanitizer } from '../src/core/sanitizer';

describe('Sanitizer', () => {
  it('should redact default sensitive headers', () => {
    const sanitizer = new Sanitizer();

    const result = sanitizer.sanitizeHeaders({
      'Authorization': 'Bearer token123',
      'Content-Type': 'application/json',
      'Cookie': 'session=abc',
    });

    expect(result['Authorization']).toBe('[REDACTED]');
    expect(result['Cookie']).toBe('[REDACTED]');
    expect(result['Content-Type']).toBe('application/json');
  });

  it('should redact custom headers', () => {
    const sanitizer = new Sanitizer({ headers: ['X-Custom-Token'] });

    const result = sanitizer.sanitizeHeaders({
      'X-Custom-Token': 'secret',
      'Accept': 'text/html',
    });

    expect(result['X-Custom-Token']).toBe('[REDACTED]');
    expect(result['Accept']).toBe('text/html');
  });

  it('should redact sensitive body keys', () => {
    const sanitizer = new Sanitizer();

    const result = sanitizer.sanitizeBody({
      username: 'john',
      password: 'secret123',
      token: 'abc',
    });

    expect(result).toEqual({
      username: 'john',
      password: '[REDACTED]',
      token: '[REDACTED]',
    });
  });

  it('should handle nested objects', () => {
    const sanitizer = new Sanitizer();

    const result = sanitizer.sanitizeBody({
      user: {
        name: 'John',
        password: 'secret',
        profile: {
          secret: 'hidden',
          bio: 'Hello',
        },
      },
    });

    expect(result).toEqual({
      user: {
        name: 'John',
        password: '[REDACTED]',
        profile: {
          secret: '[REDACTED]',
          bio: 'Hello',
        },
      },
    });
  });

  it('should handle arrays', () => {
    const sanitizer = new Sanitizer();

    const result = sanitizer.sanitizeBody([
      { password: 'a', name: 'x' },
      { password: 'b', name: 'y' },
    ]);

    expect(result).toEqual([
      { password: '[REDACTED]', name: 'x' },
      { password: '[REDACTED]', name: 'y' },
    ]);
  });

  it('should handle null and undefined', () => {
    const sanitizer = new Sanitizer();

    expect(sanitizer.sanitizeBody(null)).toBeNull();
    expect(sanitizer.sanitizeBody(undefined)).toBeUndefined();
  });

  it('should be case-insensitive', () => {
    const sanitizer = new Sanitizer();

    const result = sanitizer.sanitizeHeaders({
      'authorization': 'Bearer xyz',
      'AUTHORIZATION': 'Bearer abc',
    });

    expect(result['authorization']).toBe('[REDACTED]');
    expect(result['AUTHORIZATION']).toBe('[REDACTED]');
  });
});
