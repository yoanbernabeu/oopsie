export function getAnnotationEditorStyles(): string {
  return `
    .oopsie-annotation-editor {
      position: fixed;
      inset: 0;
      z-index: 99999999;
      display: flex;
      flex-direction: column;
      background: #111;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .oopsie-ae-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #1a1a1a;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .oopsie-ae-toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .oopsie-ae-toolbar-separator {
      width: 1px;
      height: 28px;
      background: #333;
      margin: 0 6px;
    }

    .oopsie-ae-tool-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: #ccc;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .oopsie-ae-tool-btn:hover {
      background: #2a2a2a;
      color: #fff;
    }

    .oopsie-ae-tool-btn.active {
      background: #333;
      border-color: #555;
      color: #fff;
    }

    .oopsie-ae-tool-btn svg {
      width: 20px;
      height: 20px;
    }

    .oopsie-ae-stroke-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .oopsie-ae-stroke-btn:hover {
      background: #2a2a2a;
    }

    .oopsie-ae-stroke-btn.active {
      background: #333;
      border-color: #555;
    }

    .oopsie-ae-stroke-line {
      background: #ccc;
      border-radius: 2px;
    }

    .oopsie-ae-color-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .oopsie-ae-color-btn:hover {
      transform: scale(1.15);
    }

    .oopsie-ae-color-btn.active {
      border-color: #fff;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.3);
    }

    .oopsie-ae-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .oopsie-ae-btn {
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid #444;
      background: #2a2a2a;
      color: #ccc;
      transition: all 0.15s ease;
    }

    .oopsie-ae-btn:hover {
      background: #333;
      color: #fff;
    }

    .oopsie-ae-btn-primary {
      background: #007AFF;
      border-color: #007AFF;
      color: #fff;
    }

    .oopsie-ae-btn-primary:hover {
      background: #0066DD;
      border-color: #0066DD;
    }

    .oopsie-ae-canvas-wrapper {
      flex: 1;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .oopsie-ae-canvas-container {
      position: relative;
      display: inline-block;
    }

    .oopsie-ae-canvas-container canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }
  `;
}
