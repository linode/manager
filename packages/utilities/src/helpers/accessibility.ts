/**
 * Function to send aria-live messages
 * For instance, when page is loading
 */
export const srSpeak = (text: string, priority: 'assertive' | 'polite') => {
  const el = document.createElement('div');
  const id = 'speak-' + Math.random().toString(36).substr(2, 9);
  el.setAttribute('id', id);
  el.setAttribute('aria-live', priority || 'polite');

  const srOnlyStyles = {
    borderWidth: '0',
    clip: 'rect(0, 0, 0, 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: '0',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  };

  Object.assign(el.style, srOnlyStyles);

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
