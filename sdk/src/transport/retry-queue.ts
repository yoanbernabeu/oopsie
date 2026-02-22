import type { ApiClient, ReportPayload } from './api-client';

interface PendingReport {
  payload: ReportPayload;
  storedAt: number;
}

const STORAGE_KEY = 'oopsie_pending_reports';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes

export class RetryQueue {
  private retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;

  constructor(private apiClient: ApiClient) {}

  enqueue(payload: ReportPayload): void {
    const pending = this.loadPending();
    pending.push({ payload, storedAt: Date.now() });
    this.savePending(pending);
  }

  async flush(): Promise<void> {
    const pending = this.loadPending();
    if (pending.length === 0) return;

    const now = Date.now();
    const remaining: PendingReport[] = [];

    for (const item of pending) {
      // Drop reports older than 24h
      if (now - item.storedAt > MAX_AGE_MS) continue;

      try {
        const success = await this.apiClient.sendReport(item.payload);
        if (!success) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    this.savePending(remaining);

    if (remaining.length > 0) {
      this.scheduleRetry();
    } else {
      this.attempt = 0;
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimeoutId !== null) return;

    const delay = Math.min(1000 * Math.pow(2, this.attempt), MAX_BACKOFF_MS);
    this.attempt++;

    this.retryTimeoutId = setTimeout(() => {
      this.retryTimeoutId = null;
      this.flush();
    }, delay);
  }

  private loadPending(): PendingReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private savePending(items: PendingReport[]): void {
    try {
      if (items.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      // localStorage may be unavailable
    }
  }

  hasPending(): boolean {
    return this.loadPending().length > 0;
  }

  destroy(): void {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }
}
