// Function to send aria-live messages
// Fo instance, when page is loading
export const srSpeak = (text: string, priority: 'polite' | 'assertive') => {
  const el = document.createElement('div');
  const id = 'speak-' + Date.now();
  el.setAttribute('id', id);
  el.setAttribute('aria-live', priority || 'polite');
  el.classList.add('sr-only');
  document.body.appendChild(el);
  const elementById: HTMLElement | null = document.getElementById(id);

  window.setTimeout(() => {
    if (elementById) {
      elementById.innerText = text;
    }
  }, 100);

  window.setTimeout(() => {
    if (elementById) {
      document.body.removeChild(elementById);
    }
  }, 1000);
};
