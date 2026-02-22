import type { WidgetConfig } from '../core/config';
import { getStyles } from './styles';

const BUG_ICON = `<svg viewBox="0 0 24 24"><path d="M8 2a1 1 0 011 1v1.07A5.97 5.97 0 0112 4c1.08 0 2.09.29 2.96.78L15 3a1 1 0 112 0v2a1 1 0 01-1 1h-.17A5.98 5.98 0 0118 10v1h2a1 1 0 110 2h-2v1a5.98 5.98 0 01-2.17 4.58H16a1 1 0 011 1v2a1 1 0 11-2 0v-1.07A5.97 5.97 0 0112 21a5.97 5.97 0 01-3-.79V21a1 1 0 11-2 0v-2a1 1 0 011-1h.17A5.98 5.98 0 016 14v-1H4a1 1 0 110-2h2v-1a5.98 5.98 0 012.17-4.58H8a1 1 0 01-1-1V3a1 1 0 011-1zm4 4a4 4 0 00-4 4v4a4 4 0 008 0v-4a4 4 0 00-4-4z"/></svg>`;

export class Widget {
  private shadowRoot: ShadowRoot | null = null;
  private host: HTMLElement | null = null;
  private button: HTMLButtonElement | null = null;

  constructor(
    private config: WidgetConfig,
    private onTrigger: () => void,
  ) {}

  mount(): void {
    this.host = document.createElement('div');
    this.host.id = 'oopsie-widget-host';
    document.body.appendChild(this.host);

    this.shadowRoot = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = getStyles(this.config.color, this.config.theme);
    this.shadowRoot.appendChild(style);

    this.button = document.createElement('button');
    this.button.className = `oopsie-trigger ${this.config.position}`;
    if (this.config.icon) {
      this.button.innerHTML = BUG_ICON;
    }
    this.button.appendChild(document.createTextNode(this.config.text));
    this.button.addEventListener('click', () => this.onTrigger());

    this.shadowRoot.appendChild(this.button);
  }

  unmount(): void {
    this.host?.remove();
    this.host = null;
    this.shadowRoot = null;
    this.button = null;
  }

  getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }
}
