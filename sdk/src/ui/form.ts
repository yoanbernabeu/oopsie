import type { LabelsConfig, WidgetConfig } from '../core/config';
import { getStyles } from './styles';
import { isScreenCaptureSupported, captureScreen } from './screenshot/capture';
import { AnnotationEditor } from './screenshot/annotation-editor';

export interface FormData {
  message: string;
  category: string;
  severity: string;
  email: string;
  consent: boolean;
  attachments: File[];
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export class Form {
  private overlay: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private state: FormState = 'idle';
  private errorMessage = '';
  private screenshotFile: File | null = null;

  constructor(
    private widgetConfig: WidgetConfig,
    private labels: LabelsConfig,
    private onSubmit: (data: FormData) => Promise<boolean>,
    private onClose: () => void,
    private existingShadowRoot?: ShadowRoot | null,
  ) {}

  open(): void {
    this.state = 'idle';
    this.errorMessage = '';

    if (this.existingShadowRoot) {
      this.renderInShadow(this.existingShadowRoot);
    } else {
      const host = document.createElement('div');
      host.id = 'oopsie-form-host';
      document.body.appendChild(host);
      this.shadowRoot = host.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = getStyles(this.widgetConfig.color, this.widgetConfig.theme);
      this.shadowRoot.appendChild(style);

      this.renderInShadow(this.shadowRoot);
    }
  }

  close(): void {
    if (this.existingShadowRoot) {
      this.overlay?.remove();
    } else {
      document.getElementById('oopsie-form-host')?.remove();
      this.shadowRoot = null;
    }
    this.overlay = null;
    this.onClose();
  }

  private renderInShadow(shadow: ShadowRoot): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'oopsie-overlay';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    if (this.state === 'success') {
      this.overlay.innerHTML = this.renderSuccess();
    } else {
      this.overlay.innerHTML = this.renderForm();
    }

    shadow.appendChild(this.overlay);
    this.attachEvents();
  }

  private async handleScreenshot(): Promise<void> {
    // Hide the form while capturing + annotating
    if (this.overlay) this.overlay.style.display = 'none';

    try {
      const sourceCanvas = await captureScreen();
      const editor = new AnnotationEditor(sourceCanvas);
      const result = await editor.open();

      if (this.overlay) this.overlay.style.display = '';

      if (result) {
        this.screenshotFile = result.file;
        this.rerender();
      }
    } catch {
      // User denied permission or capture failed
      if (this.overlay) this.overlay.style.display = '';
    }
  }

  private rerender(): void {
    const shadow = this.existingShadowRoot ?? this.shadowRoot;
    if (!shadow || !this.overlay) return;
    this.overlay.remove();
    this.overlay = null;
    this.renderInShadow(shadow);
  }

  private renderForm(): string {
    const errorHtml = this.state === 'error'
      ? `<div class="oopsie-error">${this.errorMessage || this.labels.errorMessage}</div>`
      : '';

    return `
      <div class="oopsie-modal">
        <div class="oopsie-header">
          <div class="oopsie-header-left">
            <div class="oopsie-header-icon">
              <svg viewBox="0 0 24 24"><path d="M8 2a1 1 0 011 1v1.07A5.97 5.97 0 0112 4c1.08 0 2.09.29 2.96.78L15 3a1 1 0 112 0v2a1 1 0 01-1 1h-.17A5.98 5.98 0 0118 10v1h2a1 1 0 110 2h-2v1a5.98 5.98 0 01-2.17 4.58H16a1 1 0 011 1v2a1 1 0 11-2 0v-1.07A5.97 5.97 0 0112 21a5.97 5.97 0 01-3-.79V21a1 1 0 11-2 0v-2a1 1 0 011-1h.17A5.98 5.98 0 016 14v-1H4a1 1 0 110-2h2v-1a5.98 5.98 0 012.17-4.58H8a1 1 0 01-1-1V3a1 1 0 011-1zm4 4a4 4 0 00-4 4v4a4 4 0 008 0v-4a4 4 0 00-4-4z"/></svg>
            </div>
            <h2>${this.labels.title}</h2>
          </div>
          <button class="oopsie-close" data-action="close">&times;</button>
        </div>
        <div class="oopsie-body">
          ${errorHtml}
          <div class="oopsie-field">
            <label for="oopsie-message">${this.labels.messagePlaceholder}</label>
            <textarea id="oopsie-message" placeholder="${this.labels.messagePlaceholder}" required></textarea>
          </div>
          <div class="oopsie-row">
            <div class="oopsie-field">
              <label for="oopsie-category">${this.labels.categoryLabel}</label>
              <select id="oopsie-category" required>
                <option value="ui">UI</option>
                <option value="crash">Crash</option>
                <option value="performance">Performance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="oopsie-field">
              <label for="oopsie-severity">${this.labels.severityLabel}</label>
              <select id="oopsie-severity" required>
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div class="oopsie-field">
            <label for="oopsie-email">Email</label>
            <input type="email" id="oopsie-email" placeholder="${this.labels.emailPlaceholder}" />
          </div>
          ${isScreenCaptureSupported() ? `
          <div class="oopsie-screenshot-row">
            <button type="button" class="oopsie-screenshot-btn" data-action="screenshot">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h2M19 9h2M9 3v2M9 19v2"/></svg>
              ${this.labels.screenshotButton}
            </button>
            ${this.screenshotFile ? `
            <div class="oopsie-screenshot-preview">
              <img src="${URL.createObjectURL(this.screenshotFile)}" alt="screenshot" />
              <button class="oopsie-screenshot-remove" data-action="remove-screenshot">&times;</button>
            </div>` : ''}
          </div>` : ''}
          <div class="oopsie-field">
            <label>${this.labels.attachmentsLabel}</label>
            <div class="oopsie-file-wrapper">
              <input type="file" id="oopsie-files" multiple accept="image/*,.pdf,.txt" />
              <div class="oopsie-file-icon">
                <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div class="oopsie-file-text"><strong>Click to upload</strong> or drag & drop</div>
            </div>
          </div>
          <div class="oopsie-consent">
            <input type="checkbox" id="oopsie-consent" />
            <label for="oopsie-consent">${this.labels.consent}</label>
          </div>
        </div>
        <div class="oopsie-footer">
          <button class="oopsie-btn" data-action="close">${this.labels.cancel}</button>
          <button class="oopsie-btn oopsie-btn-primary" data-action="submit" ${this.state === 'submitting' ? 'disabled' : ''}>${this.state === 'submitting' ? 'Sending...' : this.labels.submit}</button>
        </div>
      </div>
    `;
  }

  private renderSuccess(): string {
    return `
      <div class="oopsie-modal">
        <div class="oopsie-success">
          <div class="oopsie-success-icon">
            <svg viewBox="0 0 24 24">
              <circle class="check-circle" cx="12" cy="12" r="10"/>
              <polyline class="check-mark" points="7 13 10 16 17 9"/>
            </svg>
          </div>
          <p>${this.labels.successMessage}</p>
        </div>
      </div>
    `;
  }

  private attachEvents(): void {
    if (!this.overlay) return;

    this.overlay.querySelectorAll('[data-action="close"]').forEach((el) =>
      el.addEventListener('click', () => this.close()),
    );

    this.overlay.querySelector('[data-action="screenshot"]')?.addEventListener('click', () => {
      this.handleScreenshot();
    });

    this.overlay.querySelector('[data-action="remove-screenshot"]')?.addEventListener('click', () => {
      this.screenshotFile = null;
      this.rerender();
    });

    this.overlay.querySelector('[data-action="submit"]')?.addEventListener('click', async () => {
      const shadow = this.existingShadowRoot ?? this.shadowRoot;
      if (!shadow) return;

      const message = (shadow.querySelector('#oopsie-message') as HTMLTextAreaElement)?.value ?? '';
      const category = (shadow.querySelector('#oopsie-category') as HTMLSelectElement)?.value ?? 'other';
      const severity = (shadow.querySelector('#oopsie-severity') as HTMLSelectElement)?.value ?? 'medium';
      const email = (shadow.querySelector('#oopsie-email') as HTMLInputElement)?.value ?? '';
      const consent = (shadow.querySelector('#oopsie-consent') as HTMLInputElement)?.checked ?? false;
      const filesInput = shadow.querySelector('#oopsie-files') as HTMLInputElement;
      const attachments = filesInput?.files ? Array.from(filesInput.files) : [];
      if (this.screenshotFile) {
        attachments.push(this.screenshotFile);
      }

      if (!message.trim()) return;
      if (!consent) return;

      this.state = 'submitting';
      const submitBtn = this.overlay?.querySelector('[data-action="submit"]') as HTMLButtonElement;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const success = await this.onSubmit({ message, category, severity, email, consent, attachments });
        if (success) {
          this.state = 'success';
          this.overlay!.innerHTML = this.renderSuccess();
          setTimeout(() => this.close(), 2000);
        } else {
          this.state = 'error';
          this.errorMessage = this.labels.errorMessage;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = this.labels.submit;
          }
        }
      } catch {
        this.state = 'error';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = this.labels.submit;
        }
      }
    });
  }
}
