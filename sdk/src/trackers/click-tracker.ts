import type { RollingBuffer } from '../core/buffer';
import { generateSelector } from '../utils/css-selector';

export class ClickTracker {
  private handler: ((e: MouseEvent) => void) | null = null;

  constructor(private buffer: RollingBuffer) {}

  start(): void {
    this.handler = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      this.buffer.push({
        type: 'click',
        timestamp: Date.now(),
        data: {
          selector: generateSelector(target),
          x: e.clientX,
          y: e.clientY,
          tagName: target.tagName.toLowerCase(),
          textContent: (target.textContent ?? '').slice(0, 100),
        },
      });
    };

    document.addEventListener('click', this.handler, { capture: true, passive: true });
  }

  stop(): void {
    if (this.handler) {
      document.removeEventListener('click', this.handler, { capture: true });
      this.handler = null;
    }
  }
}
