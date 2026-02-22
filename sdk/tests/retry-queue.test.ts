import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryQueue } from '../src/transport/retry-queue';
import type { ApiClient, ReportPayload } from '../src/transport/api-client';

const mockPayload: ReportPayload = {
  message: 'Test bug',
  category: 'ui',
  severity: 'medium',
  consentGiven: true,
  deviceInfo: {},
  pageUrl: 'https://example.com',
  timeline: [],
  consoleErrors: [],
  networkFailures: [],
};

describe('RetryQueue', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
    });
  });

  it('should enqueue a report to localStorage', () => {
    const mockClient = { sendReport: vi.fn() } as unknown as ApiClient;
    const queue = new RetryQueue(mockClient);

    queue.enqueue(mockPayload);

    expect(queue.hasPending()).toBe(true);
  });

  it('should flush and send pending reports', async () => {
    const mockClient = {
      sendReport: vi.fn().mockResolvedValue(true),
    } as unknown as ApiClient;

    const queue = new RetryQueue(mockClient);
    queue.enqueue(mockPayload);

    await queue.flush();

    expect(mockClient.sendReport).toHaveBeenCalledWith(mockPayload);
    expect(queue.hasPending()).toBe(false);
  });

  it('should keep reports on send failure', async () => {
    const mockClient = {
      sendReport: vi.fn().mockResolvedValue(false),
    } as unknown as ApiClient;

    const queue = new RetryQueue(mockClient);
    queue.enqueue(mockPayload);

    await queue.flush();

    expect(queue.hasPending()).toBe(true);
    queue.destroy();
  });
});
