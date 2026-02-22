import type { LabelsConfig, WidgetConfig } from '../core/config';
import { getStyles } from './styles';

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

  private renderForm(): string {
    const errorHtml = this.state === 'error'
      ? `<div class="oopsie-error">${this.errorMessage || this.labels.errorMessage}</div>`
      : '';

    return `
      <div class="oopsie-modal">
        <div class="oopsie-header">
          <h2>${this.labels.title}</h2>
          <button class="oopsie-close" data-action="close">&times;</button>
        </div>
        <div class="oopsie-body">
          ${errorHtml}
          <div class="oopsie-field">
            <label for="oopsie-message">${this.labels.title}</label>
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
          <div class="oopsie-field">
            <label for="oopsie-files">${this.labels.attachmentsLabel}</label>
            <input type="file" id="oopsie-files" multiple accept="image/*,.pdf,.txt" />
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
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <p>${this.labels.successMessage}</p>
        </div>
      </div>
    `;
  }

  private attachEvents(): void {
    if (!this.overlay) return;

    this.overlay.querySelector('[data-action="close"]')?.addEventListener('click', () => this.close());

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
