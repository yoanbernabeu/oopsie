export function getStyles(color: string, theme: 'light' | 'dark'): string {
  const bg = theme === 'light' ? '#ffffff' : '#1e1e2e';
  const text = theme === 'light' ? '#0f172a' : '#e2e8f0';
  const border = theme === 'light' ? '#e2e8f0' : '#334155';
  const muted = theme === 'light' ? '#64748b' : '#94a3b8';
  const inputBg = theme === 'light' ? '#f8fafc' : '#2a2a3e';

  return `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: ${text};
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .oopsie-trigger {
      position: fixed;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: 24px;
      background: ${color};
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .oopsie-trigger:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }

    .oopsie-trigger.bottom-right { bottom: 20px; right: 20px; }
    .oopsie-trigger.bottom-left { bottom: 20px; left: 20px; }
    .oopsie-trigger.top-right { top: 20px; right: 20px; }
    .oopsie-trigger.top-left { top: 20px; left: 20px; }

    .oopsie-trigger svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }

    .oopsie-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px);
    }

    .oopsie-modal {
      background: ${bg};
      border: 1px solid ${border};
      border-radius: 12px;
      width: 90%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    .oopsie-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid ${border};
    }

    .oopsie-header h2 {
      font-size: 16px;
      font-weight: 600;
      color: ${text};
    }

    .oopsie-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: ${muted};
      padding: 4px;
      line-height: 1;
    }

    .oopsie-body { padding: 20px; }

    .oopsie-field {
      margin-bottom: 16px;
    }

    .oopsie-field label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
      color: ${text};
    }

    .oopsie-field textarea,
    .oopsie-field input[type="email"],
    .oopsie-field select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid ${border};
      border-radius: 8px;
      background: ${inputBg};
      color: ${text};
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }

    .oopsie-field textarea:focus,
    .oopsie-field input:focus,
    .oopsie-field select:focus {
      border-color: ${color};
    }

    .oopsie-field textarea {
      min-height: 100px;
      resize: vertical;
    }

    .oopsie-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .oopsie-consent {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 16px;
    }

    .oopsie-consent input[type="checkbox"] {
      margin-top: 2px;
      accent-color: ${color};
    }

    .oopsie-consent label {
      font-size: 12px;
      color: ${muted};
      line-height: 1.4;
    }

    .oopsie-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 20px;
      border-top: 1px solid ${border};
    }

    .oopsie-btn {
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
      border: 1px solid ${border};
      background: ${bg};
      color: ${text};
    }

    .oopsie-btn-primary {
      background: ${color};
      color: #ffffff;
      border-color: ${color};
    }

    .oopsie-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .oopsie-success {
      text-align: center;
      padding: 40px 20px;
    }

    .oopsie-success svg {
      width: 48px;
      height: 48px;
      fill: #10b981;
      margin-bottom: 12px;
    }

    .oopsie-success p {
      color: ${text};
      font-size: 15px;
    }

    .oopsie-error {
      background: #fef2f2;
      color: #dc2626;
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }
  `;
}
