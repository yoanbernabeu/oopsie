import { RollingBuffer } from './core/buffer';
import {
  DEFAULT_BUFFER_DURATION,
  DEFAULT_LABELS,
  DEFAULT_SANITIZE_CONFIG,
  DEFAULT_WIDGET_CONFIG,
  type LabelsConfig,
  type OopsieConfig,
  type WidgetConfig,
} from './core/config';
import { Sanitizer } from './core/sanitizer';
import { ClickTracker } from './trackers/click-tracker';
import { ConsoleTracker } from './trackers/console-tracker';
import { NavigationTracker } from './trackers/navigation-tracker';
import { NetworkTracker } from './trackers/network-tracker';
import { ApiClient } from './transport/api-client';
import { RetryQueue } from './transport/retry-queue';
import { Form, type FormData } from './ui/form';
import { Widget } from './ui/widget';
import { collectDeviceInfo } from './utils/device-info';

let buffer: RollingBuffer;
let sanitizer: Sanitizer;
let apiClient: ApiClient;
let retryQueue: RetryQueue;
let widget: Widget | null = null;
let form: Form | null = null;
let clickTracker: ClickTracker;
let navigationTracker: NavigationTracker;
let consoleTracker: ConsoleTracker;
let networkTracker: NetworkTracker;
let config: OopsieConfig;
let widgetConfig: WidgetConfig;
let labelsConfig: LabelsConfig;
let initialized = false;

function init(userConfig: OopsieConfig): void {
  if (initialized) return;

  config = userConfig;
  widgetConfig = { ...DEFAULT_WIDGET_CONFIG, ...userConfig.widget };
  labelsConfig = { ...DEFAULT_LABELS, ...userConfig.labels };

  const bufferDuration = userConfig.bufferDuration ?? DEFAULT_BUFFER_DURATION;

  buffer = new RollingBuffer(bufferDuration);
  sanitizer = new Sanitizer({
    ...DEFAULT_SANITIZE_CONFIG,
    ...userConfig.sanitize,
  });
  apiClient = new ApiClient(userConfig.serverUrl, userConfig.apiKey);
  retryQueue = new RetryQueue(apiClient);

  // Start trackers
  clickTracker = new ClickTracker(buffer);
  navigationTracker = new NavigationTracker(buffer);
  consoleTracker = new ConsoleTracker(buffer);
  networkTracker = new NetworkTracker(buffer, sanitizer, userConfig.serverUrl);

  clickTracker.start();
  navigationTracker.start();
  consoleTracker.start();
  networkTracker.start();

  // Mount widget if enabled
  if (widgetConfig.enabled) {
    widget = new Widget(widgetConfig, () => openForm());
    widget.mount();
  }

  // Flush pending reports from previous sessions
  retryQueue.flush();

  initialized = true;
}

function openForm(): void {
  if (form) return;

  form = new Form(
    widgetConfig,
    labelsConfig,
    handleSubmit,
    () => { form = null; },
    widget?.getShadowRoot(),
  );
  form.open();
}

function closeForm(): void {
  form?.close();
  form = null;
}

async function handleSubmit(formData: FormData): Promise<boolean> {
  const timeline = buffer.snapshot();
  const deviceInfo = collectDeviceInfo();

  const consoleErrors = timeline
    .filter((e) => e.type === 'console_error')
    .map((e) => e.data);

  const networkFailures = timeline
    .filter((e) => e.type === 'network_failure')
    .map((e) => e.data);

  const payload = {
    message: formData.message,
    category: formData.category,
    severity: formData.severity,
    reporterEmail: formData.email || undefined,
    consentGiven: formData.consent,
    userContext: config.user ?? undefined,
    customMetadata: config.metadata ?? undefined,
    deviceInfo,
    pageUrl: window.location.href,
    timeline: timeline.map((e) => ({ type: e.type, timestamp: e.timestamp, ...e.data })),
    consoleErrors,
    networkFailures,
  };

  try {
    const success = await apiClient.sendReport(payload, formData.attachments);
    if (success) {
      buffer.clear();
      return true;
    }
    retryQueue.enqueue(payload);
    return false;
  } catch {
    retryQueue.enqueue(payload);
    return false;
  }
}

function destroy(): void {
  clickTracker?.stop();
  navigationTracker?.stop();
  consoleTracker?.stop();
  networkTracker?.stop();
  widget?.unmount();
  retryQueue?.destroy();
  form?.close();
  form = null;
  widget = null;
  initialized = false;
}

// Public API
const Oopsie = { init, open: openForm, close: closeForm, destroy };

export default Oopsie;
export { init, openForm as open, closeForm as close, destroy };

// CDN auto-init
if (typeof window !== 'undefined') {
  (window as unknown as { Oopsie: typeof Oopsie }).Oopsie = Oopsie;

  const globalConfig = (window as unknown as { OopsieConfig?: OopsieConfig }).OopsieConfig;
  if (globalConfig) {
    init(globalConfig);
  }
}
