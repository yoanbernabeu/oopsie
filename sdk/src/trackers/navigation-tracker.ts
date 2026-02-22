import type { RollingBuffer } from '../core/buffer';

export class NavigationTracker {
  private originalPushState: typeof history.pushState | null = null;
  private originalReplaceState: typeof history.replaceState | null = null;
  private popstateHandler: (() => void) | null = null;

  constructor(private buffer: RollingBuffer) {}

  start(): void {
    // Record initial page
    this.recordNavigation(window.location.href);

    // Monkey-patch pushState
    this.originalPushState = history.pushState.bind(history);
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      this.originalPushState!(...args);
      this.recordNavigation(window.location.href);
    };

    // Monkey-patch replaceState
    this.originalReplaceState = history.replaceState.bind(history);
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      this.originalReplaceState!(...args);
      this.recordNavigation(window.location.href);
    };

    // Listen for popstate (back/forward)
    this.popstateHandler = () => this.recordNavigation(window.location.href);
    window.addEventListener('popstate', this.popstateHandler);
  }

  stop(): void {
    if (this.originalPushState) {
      history.pushState = this.originalPushState;
      this.originalPushState = null;
    }
    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
      this.originalReplaceState = null;
    }
    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
      this.popstateHandler = null;
    }
  }

  private recordNavigation(url: string): void {
    this.buffer.push({
      type: 'navigation',
      timestamp: Date.now(),
      data: {
        url,
        referrer: document.referrer,
      },
    });
  }
}
