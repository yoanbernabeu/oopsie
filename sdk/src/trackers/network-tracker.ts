import type { RollingBuffer } from '../core/buffer';
import { Sanitizer } from '../core/sanitizer';

export class NetworkTracker {
  private originalFetch: typeof fetch | null = null;
  private originalXhrOpen: typeof XMLHttpRequest.prototype.open | null = null;
  private originalXhrSend: typeof XMLHttpRequest.prototype.send | null = null;

  constructor(
    private buffer: RollingBuffer,
    private sanitizer: Sanitizer,
    private serverUrl: string,
  ) {}

  start(): void {
    this.patchFetch();
    this.patchXhr();
  }

  stop(): void {
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
    if (this.originalXhrOpen) {
      XMLHttpRequest.prototype.open = this.originalXhrOpen;
      this.originalXhrOpen = null;
    }
    if (this.originalXhrSend) {
      XMLHttpRequest.prototype.send = this.originalXhrSend;
      this.originalXhrSend = null;
    }
  }

  private isOwnRequest(url: string): boolean {
    try {
      return new URL(url, window.location.origin).origin === new URL(this.serverUrl).origin;
    } catch {
      return false;
    }
  }

  private patchFetch(): void {
    this.originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

      if (this.isOwnRequest(url)) {
        return this.originalFetch!(input, init);
      }

      const startTime = Date.now();
      try {
        const response = await this.originalFetch!(input, init);

        if (!response.ok) {
          this.buffer.push({
            type: 'network_failure',
            timestamp: Date.now(),
            data: {
              url,
              method: init?.method ?? 'GET',
              status: response.status,
              duration: Date.now() - startTime,
              requestHeaders: this.sanitizer.sanitizeHeaders(
                this.extractHeaders(init?.headers),
              ),
            },
          });
        }

        return response;
      } catch (error) {
        this.buffer.push({
          type: 'network_failure',
          timestamp: Date.now(),
          data: {
            url,
            method: init?.method ?? 'GET',
            status: 0,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
          },
        });
        throw error;
      }
    };
  }

  private patchXhr(): void {
    this.originalXhrOpen = XMLHttpRequest.prototype.open;
    this.originalXhrSend = XMLHttpRequest.prototype.send;

    const tracker = this;

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest & { _oopsie_url?: string; _oopsie_method?: string },
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ) {
      this._oopsie_url = String(url);
      this._oopsie_method = method;
      return tracker.originalXhrOpen!.call(this, method, url, ...(rest as [boolean?, string?, string?]));
    };

    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest & { _oopsie_url?: string; _oopsie_method?: string },
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      const url = this._oopsie_url ?? '';
      const method = this._oopsie_method ?? 'GET';

      if (tracker.isOwnRequest(url)) {
        return tracker.originalXhrSend!.call(this, body);
      }

      const startTime = Date.now();
      this.addEventListener('loadend', () => {
        if (this.status >= 400 || this.status === 0) {
          tracker.buffer.push({
            type: 'network_failure',
            timestamp: Date.now(),
            data: {
              url,
              method,
              status: this.status,
              duration: Date.now() - startTime,
            },
          });
        }
      });

      return tracker.originalXhrSend!.call(this, body);
    };
  }

  private extractHeaders(headers?: HeadersInit): Record<string, string> {
    const result: Record<string, string> = {};
    if (!headers) return result;

    if (headers instanceof Headers) {
      headers.forEach((value, key) => { result[key] = value; });
    } else if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        result[key] = value;
      }
    } else {
      Object.assign(result, headers);
    }
    return result;
  }
}
