let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function triggerUnauthorized() {
  if (onUnauthorized) onUnauthorized();
}
