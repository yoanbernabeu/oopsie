export function createContainer(id: string): HTMLDivElement {
  const existing = document.getElementById(id) as HTMLDivElement | null;
  if (existing) return existing;

  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
  return container;
}

export function removeContainer(id: string): void {
  document.getElementById(id)?.remove();
}
