export interface BufferEvent {
  type: 'navigation' | 'click' | 'console_error' | 'network_failure';
  timestamp: number;
  data: Record<string, unknown>;
}

export class RollingBuffer {
  private events: BufferEvent[] = [];
  private duration: number;

  constructor(duration: number) {
    this.duration = duration;
  }

  push(event: BufferEvent): void {
    this.prune();
    this.events.push(event);
  }

  snapshot(): BufferEvent[] {
    this.prune();
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  size(): number {
    return this.events.length;
  }

  private prune(): void {
    const cutoff = Date.now() - this.duration;
    this.events = this.events.filter((e) => e.timestamp >= cutoff);
  }
}
