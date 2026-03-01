export interface WidgetConfig {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color: string;
  theme: 'light' | 'dark';
  text: string;
  icon: boolean;
}

export interface SanitizeConfig {
  headers: string[];
  bodyKeys: string[];
}

export interface LabelsConfig {
  title: string;
  messagePlaceholder: string;
  submit: string;
  cancel: string;
  consent: string;
  categoryLabel: string;
  severityLabel: string;
  emailPlaceholder: string;
  attachmentsLabel: string;
  screenshotButton: string;
  successMessage: string;
  errorMessage: string;
}

export interface OopsieConfig {
  serverUrl: string;
  apiKey: string;
  widget?: Partial<WidgetConfig>;
  user?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  labels?: Partial<LabelsConfig>;
  sanitize?: Partial<SanitizeConfig>;
  bufferDuration?: number;
}

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  enabled: true,
  position: 'bottom-right',
  color: '#FF5C39',
  theme: 'light',
  text: 'Report a bug',
  icon: true,
};

export const DEFAULT_SANITIZE_CONFIG: SanitizeConfig = {
  headers: ['Authorization', 'Cookie', 'Set-Cookie', 'X-API-Key'],
  bodyKeys: [
    'password', 'passwd', 'secret', 'token', 'access_token',
    'refresh_token', 'creditCard', 'credit_card', 'ssn', 'social_security',
  ],
};

export const DEFAULT_LABELS: LabelsConfig = {
  title: 'Report a bug',
  messagePlaceholder: 'Describe what happened...',
  submit: 'Send report',
  cancel: 'Cancel',
  consent: 'I agree to send my browsing data for bug analysis',
  categoryLabel: 'Category',
  severityLabel: 'Severity',
  emailPlaceholder: 'Your email (optional)',
  attachmentsLabel: 'Attachments',
  screenshotButton: 'Screenshot',
  successMessage: 'Report sent successfully!',
  errorMessage: 'Failed to send report. It will be retried automatically.',
};

export const DEFAULT_BUFFER_DURATION = 5 * 60 * 1000; // 5 minutes
