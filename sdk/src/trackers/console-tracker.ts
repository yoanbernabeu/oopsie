import type { RollingBuffer } from '../core/buffer';

export class ConsoleTracker {
  private originalOnError: OnErrorEventHandler | null = null;
  private rejectionHandler: ((e: PromiseRejectionEvent) => void) | null = null;

  constructor(private buffer: RollingBuffer) {}

  start(): void {
    // Capture window.onerror
    this.originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      this.buffer.push({
        type: 'console_error',
        timestamp: Date.now(),
        data: {
          message: String(message),
          source: source ?? null,
          lineno: lineno ?? null,
          colno: colno ?? null,
          stack: error?.stack ?? null,
        },
      });

      if (typeof this.originalOnError === 'function') {
        return this.originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Capture unhandled promise rejections
    this.rejectionHandler = (e: PromiseRejectionEvent) => {
      this.buffer.push({
        type: 'console_error',
        timestamp: Date.now(),
        data: {
          message: e.reason?.message ?? String(e.reason),
          stack: e.reason?.stack ?? null,
          unhandledRejection: true,
        },
      });
    };
    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

  stop(): void {
    if (this.originalOnError !== null) {
      window.onerror = this.originalOnError;
      this.originalOnError = null;
    }
    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
      this.rejectionHandler = null;
    }
  }
}
