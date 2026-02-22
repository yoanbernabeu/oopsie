export interface ReportPayload {
  message: string;
  category: string;
  severity: string;
  reporterEmail?: string;
  consentGiven: boolean;
  userContext?: Record<string, unknown>;
  customMetadata?: Record<string, unknown>;
  deviceInfo: Record<string, unknown>;
  pageUrl: string;
  timeline: unknown[];
  consoleErrors: unknown[];
  networkFailures: unknown[];
}

export class ApiClient {
  constructor(
    private serverUrl: string,
    private apiKey: string,
  ) {}

  async sendReport(payload: ReportPayload, attachments?: File[]): Promise<boolean> {
    const url = `${this.serverUrl.replace(/\/$/, '')}/api/v1/reports`;

    const hasAttachments = attachments && attachments.length > 0;

    let body: FormData | string;
    const headers: Record<string, string> = {
      'X-Oopsie-Key': this.apiKey,
    };

    if (hasAttachments) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      for (const file of attachments) {
        formData.append('attachments[]', file);
      }
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(payload);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    return response.ok;
  }
}
