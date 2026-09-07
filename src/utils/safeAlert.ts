export function safeAlert(message: string): void {
  try {
    window.alert(message);
  } catch (e) {
    console.warn('[Notification]:', message);
  }
}

export function safeConfirm(message: string, fallback = true): boolean {
  try {
    return window.confirm(message);
  } catch (e) {
    console.warn('[Confirmation Blocked in Sandbox]:', message);
    return fallback;
  }
}
