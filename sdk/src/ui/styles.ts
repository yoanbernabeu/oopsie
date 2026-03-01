export function getStyles(color: string, theme: 'light' | 'dark'): string {
  const bg = theme === 'light' ? '#ffffff' : '#1a1a2e';
  const text = theme === 'light' ? '#0f172a' : '#e2e8f0';
  const textSecondary = theme === 'light' ? '#475569' : '#94a3b8';
  const border = theme === 'light' ? '#e2e8f0' : '#2d2d44';
  const muted = theme === 'light' ? '#64748b' : '#94a3b8';
  const inputBg = theme === 'light' ? '#f8fafc' : '#252540';
  const inputBgHover = theme === 'light' ? '#f1f5f9' : '#2a2a48';
  const surfaceBg = theme === 'light' ? '#f8fafc' : '#1e1e36';
  const focusRing = `${color}33`; // 20% opacity

  return `
    @keyframes oopsie-fadein {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes oopsie-slideup {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes oopsie-trigger-enter {
      from { opacity: 0; transform: scale(0.8) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes oopsie-check-draw {
      from { stroke-dashoffset: 24; }
      to { stroke-dashoffset: 0; }
    }

    @keyframes oopsie-check-circle {
      from { stroke-dashoffset: 64; }
      to { stroke-dashoffset: 0; }
    }

    @keyframes oopsie-pulse-ring {
      0% { box-shadow: 0 0 0 0 ${color}40; }
      70% { box-shadow: 0 0 0 8px ${color}00; }
      100% { box-shadow: 0 0 0 0 ${color}00; }
    }

    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 14px;
      color: ${text};
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ---- Trigger Button ---- */
    .oopsie-trigger {
      position: fixed;
      z-index: 999999;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 50px;
      background: ${color};
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 4px 16px ${color}40, 0 2px 4px rgba(0,0,0,0.08);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      animation: oopsie-trigger-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .oopsie-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px ${color}50, 0 4px 8px rgba(0,0,0,0.1);
    }

    .oopsie-trigger:active {
      transform: translateY(0) scale(0.97);
      box-shadow: 0 2px 8px ${color}30;
    }

    .oopsie-trigger.bottom-right { bottom: 24px; right: 24px; }
    .oopsie-trigger.bottom-left { bottom: 24px; left: 24px; }
    .oopsie-trigger.top-right { top: 24px; right: 24px; }
    .oopsie-trigger.top-left { top: 24px; left: 24px; }

    .oopsie-trigger svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
      flex-shrink: 0;
    }

    /* ---- Overlay ---- */
    .oopsie-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      animation: oopsie-fadein 0.2s ease-out;
    }

    /* ---- Modal ---- */
    .oopsie-modal {
      background: ${bg};
      border: 1px solid ${border};
      border-radius: 16px;
      width: 90%;
      max-width: 460px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 24px 48px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.08);
      animation: oopsie-slideup 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .oopsie-modal::-webkit-scrollbar { width: 6px; }
    .oopsie-modal::-webkit-scrollbar-track { background: transparent; }
    .oopsie-modal::-webkit-scrollbar-thumb {
      background: ${border};
      border-radius: 3px;
    }

    /* ---- Header ---- */
    .oopsie-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid ${border};
    }

    .oopsie-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .oopsie-header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: ${color}15;
    }

    .oopsie-header-icon svg {
      width: 18px;
      height: 18px;
      fill: ${color};
    }

    .oopsie-header h2 {
      font-size: 16px;
      font-weight: 700;
      color: ${text};
      letter-spacing: -0.01em;
    }

    .oopsie-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: ${surfaceBg};
      border: 1px solid ${border};
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      color: ${muted};
      line-height: 1;
      transition: all 0.15s ease;
    }

    .oopsie-close:hover {
      background: ${inputBgHover};
      color: ${text};
    }

    /* ---- Body ---- */
    .oopsie-body { padding: 24px; }

    .oopsie-field {
      margin-bottom: 20px;
    }

    .oopsie-field label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: ${textSecondary};
      letter-spacing: 0.01em;
    }

    .oopsie-field textarea,
    .oopsie-field input[type="email"],
    .oopsie-field select {
      width: 100%;
      padding: 10px 14px;
      border: 1.5px solid ${border};
      border-radius: 10px;
      background: ${inputBg};
      color: ${text};
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .oopsie-field textarea::placeholder,
    .oopsie-field input::placeholder {
      color: ${muted};
      opacity: 0.7;
    }

    .oopsie-field textarea:hover,
    .oopsie-field input[type="email"]:hover,
    .oopsie-field select:hover {
      border-color: ${muted};
      background: ${inputBgHover};
    }

    .oopsie-field textarea:focus,
    .oopsie-field input[type="email"]:focus,
    .oopsie-field select:focus {
      border-color: ${color};
      box-shadow: 0 0 0 3px ${focusRing};
      background: ${bg};
    }

    .oopsie-field textarea {
      min-height: 100px;
      resize: vertical;
      line-height: 1.5;
    }

    .oopsie-field select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 12 12'%3E%3Cpath stroke='${encodeURIComponent(muted)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M3 4.5 6 7.5 9 4.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
      cursor: pointer;
    }

    /* ---- File Input ---- */
    .oopsie-file-wrapper {
      position: relative;
      border: 1.5px dashed ${border};
      border-radius: 10px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background: ${inputBg};
    }

    .oopsie-file-wrapper:hover {
      border-color: ${color};
      background: ${color}08;
    }

    .oopsie-file-wrapper input[type="file"] {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .oopsie-file-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 6px;
    }

    .oopsie-file-icon svg {
      width: 24px;
      height: 24px;
      stroke: ${muted};
      fill: none;
    }

    .oopsie-file-text {
      font-size: 13px;
      color: ${muted};
    }

    .oopsie-file-text strong {
      color: ${color};
      font-weight: 600;
    }

    /* ---- Row Grid ---- */
    .oopsie-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* ---- Consent ---- */
    .oopsie-consent {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 4px;
      padding: 12px 14px;
      border-radius: 10px;
      background: ${surfaceBg};
      border: 1px solid ${border};
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .oopsie-consent:hover {
      background: ${inputBgHover};
    }

    .oopsie-consent input[type="checkbox"] {
      margin-top: 1px;
      accent-color: ${color};
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      cursor: pointer;
    }

    .oopsie-consent label {
      font-size: 12.5px;
      color: ${muted};
      line-height: 1.5;
      cursor: pointer;
    }

    /* ---- Footer ---- */
    .oopsie-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px 20px;
      border-top: 1px solid ${border};
    }

    .oopsie-btn {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1.5px solid ${border};
      background: ${bg};
      color: ${textSecondary};
    }

    .oopsie-btn:hover {
      background: ${inputBgHover};
      border-color: ${muted};
    }

    .oopsie-btn-primary {
      background: ${color};
      color: #ffffff;
      border-color: ${color};
      box-shadow: 0 2px 8px ${color}30;
    }

    .oopsie-btn-primary:hover {
      background: ${color};
      filter: brightness(1.1);
      box-shadow: 0 4px 12px ${color}40;
      border-color: ${color};
    }

    .oopsie-btn-primary:active {
      filter: brightness(0.95);
      box-shadow: 0 1px 4px ${color}20;
    }

    .oopsie-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: none;
      box-shadow: none;
    }

    /* ---- Success State ---- */
    .oopsie-success {
      text-align: center;
      padding: 48px 24px;
    }

    .oopsie-success-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .oopsie-success-icon svg {
      width: 56px;
      height: 56px;
    }

    .oopsie-success-icon .check-circle {
      stroke: #10b981;
      fill: none;
      stroke-width: 1.5;
      stroke-dasharray: 64;
      animation: oopsie-check-circle 0.5s ease-out both;
    }

    .oopsie-success-icon .check-mark {
      stroke: #10b981;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 24;
      animation: oopsie-check-draw 0.3s ease-out 0.3s both;
    }

    .oopsie-success p {
      color: ${text};
      font-size: 15px;
      font-weight: 500;
    }

    /* ---- Screenshot ---- */
    .oopsie-screenshot-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .oopsie-screenshot-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1.5px solid ${border};
      border-radius: 10px;
      background: ${inputBg};
      color: ${textSecondary};
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .oopsie-screenshot-btn:hover {
      border-color: ${color};
      background: ${color}08;
      color: ${color};
    }

    .oopsie-screenshot-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .oopsie-screenshot-preview {
      position: relative;
      display: inline-flex;
    }

    .oopsie-screenshot-preview img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
      border: 1.5px solid ${border};
    }

    .oopsie-screenshot-remove {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${theme === 'light' ? '#dc2626' : '#f87171'};
      color: #fff;
      border: none;
      font-size: 12px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ---- Error ---- */
    .oopsie-error {
      background: ${theme === 'light' ? '#fef2f2' : '#3b1c1c'};
      color: ${theme === 'light' ? '#dc2626' : '#f87171'};
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
      border: 1px solid ${theme === 'light' ? '#fecaca' : '#5c2020'};
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .oopsie-error::before {
      content: '!';
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${theme === 'light' ? '#dc2626' : '#f87171'};
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
  `;
}
