export function collectDeviceInfo(): Record<string, unknown> {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const screen = typeof window !== 'undefined' ? window.screen : null;

  return {
    userAgent: nav?.userAgent ?? null,
    language: nav?.language ?? null,
    platform: nav?.platform ?? null,
    screenWidth: screen?.width ?? null,
    screenHeight: screen?.height ?? null,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : null,
    timezone: Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone ?? null,
    online: nav?.onLine ?? null,
    connectionType: (nav as unknown as { connection?: { effectiveType?: string } })?.connection?.effectiveType ?? null,
  };
}
