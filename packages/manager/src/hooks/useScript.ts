import { useState, useEffect } from 'react';

export enum ScriptStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

/**
 * Used to load a traditional Javascript file as if you were using html script tags
 * The logic comes from https://usehooks.com/useScript/
 * @param src is the source url of the script you intend to load
 * @param setStatus pass a react state set function so the hook's state can be updated
 * @returns void
 */
const loadScript = (src: string, setStatus: (status: string) => void) => {
  // Allow falsy src value if waiting on other data needed for
  // constructing the script URL passed to this hook.
  if (!src) {
    setStatus('idle');
    return;
  }
  // Fetch existing script element by src
  // It may have been added by another intance of this hook
  let script = document.querySelector(
    `script[src='${src}']`
  ) as HTMLScriptElement;
  if (!script) {
    // Create script
    script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute('data-status', 'loading');
    // Add script to document body
    document.body.appendChild(script);
    // Store status in attribute on script
    // This can be read by other instances of this hook
    const setAttributeFromEvent = (event: any) => {
      script.setAttribute(
        'data-status',
        event.type === 'load' ? 'ready' : 'error'
      );
    };
    script.addEventListener('load', setAttributeFromEvent);
    script.addEventListener('error', setAttributeFromEvent);
  } else {
    // Grab existing script status from attribute and set to state.
    setStatus(script.getAttribute('data-status') ?? '');
  }
  // Script event handler to update status in state
  // Note: Even if the script already exists we still need to add
  // event handlers to update the state for *this* hook instance.
  const setStateFromEvent = (event: any) => {
    setStatus(event.type === 'load' ? 'ready' : 'error');
  };
  // Add event listeners
  script.addEventListener('load', setStateFromEvent);
  script.addEventListener('error', setStateFromEvent);
  // Remove event listeners on cleanup
  return () => {
    if (script) {
      script.removeEventListener('load', setStateFromEvent);
      script.removeEventListener('error', setStateFromEvent);
    }
  };
};

/**
 * useScript is a hook that will load your src script for a React component
 * @param src the source URL of your JS script
 * @returns {ScriptStatus} the status of the script you are loading
 */
export const useScript = (src: string): ScriptStatus => {
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  useEffect(() => loadScript(src, setStatus), [src]);

  return status as ScriptStatus;
};

/**
 * useLazyScript is a hook that will load your src
 * script upon a call to load for a React component
 * @param src the source URL of your JS script
 * @returns an object containing the status and the function you can call to start loading the script
 */
export const useLazyScript = (
  src: string
): {
  status: ScriptStatus;
  load: () => void;
} => {
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  return {
    status: status as ScriptStatus,
    load: () => loadScript(src, setStatus),
  };
};
