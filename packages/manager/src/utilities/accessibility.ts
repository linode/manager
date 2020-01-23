// Function to send aria-live messages
// Fo instance, when page is loading
export const srSpeak = (text: string, priority: 'polite' | 'assertive') => {
  const el = document.createElement('div');
  const id =
    'speak-' +
    Math.random()
      .toString(36)
      .substr(2, 9);
  el.setAttribute('id', id);
  el.setAttribute('aria-live', priority || 'polite');
  el.classList.add('sr-only');
  document.body.appendChild(el);
  const elementById: HTMLElement | null = document.getElementById(id);

  if (elementById) {
    window.setTimeout(() => {
      elementById.innerText = text;
    }, 100);
  }

  if (elementById) {
    window.setTimeout(() => {
      document.body.removeChild(elementById);
    }, 1000);
  }
};
