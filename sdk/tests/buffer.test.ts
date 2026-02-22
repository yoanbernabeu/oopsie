import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RollingBuffer, type BufferEvent } from '../src/core/buffer';

describe('RollingBuffer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store events', () => {
    const buffer = new RollingBuffer(5000);

    buffer.push({ type: 'click', timestamp: Date.now(), data: { x: 1 } });
    buffer.push({ type: 'navigation', timestamp: Date.now(), data: { url: '/test' } });

    expect(buffer.size()).toBe(2);
  });

  it('should return a snapshot copy', () => {
    const buffer = new RollingBuffer(5000);
    const event: BufferEvent = { type: 'click', timestamp: Date.now(), data: { x: 1 } };

    buffer.push(event);
    const snapshot = buffer.snapshot();

    expect(snapshot).toHaveLength(1);
    expect(snapshot[0]).toEqual(event);

    // Snapshot should be a copy
    snapshot.push({ type: 'click', timestamp: Date.now(), data: {} });
    expect(buffer.size()).toBe(1);
  });

  it('should prune events older than duration', () => {
    const buffer = new RollingBuffer(5000);

    buffer.push({ type: 'click', timestamp: Date.now(), data: {} });

    vi.advanceTimersByTime(6000);

    buffer.push({ type: 'click', timestamp: Date.now(), data: {} });

    expect(buffer.size()).toBe(1);
  });

  it('should clear all events', () => {
    const buffer = new RollingBuffer(5000);

    buffer.push({ type: 'click', timestamp: Date.now(), data: {} });
    buffer.push({ type: 'click', timestamp: Date.now(), data: {} });
    buffer.clear();

    expect(buffer.size()).toBe(0);
    expect(buffer.snapshot()).toEqual([]);
  });
});
