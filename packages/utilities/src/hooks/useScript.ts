import { useEffect, useState } from 'react';

type ScriptStatus = 'error' | 'idle' | 'loading' | 'ready';
type ScriptLocation = 'body' | 'head';

interface ScriptOptions {
  location?: ScriptLocation;
  setStatus?: (status: ScriptStatus) => void;
}

/**
 * Used to load a traditional Javascript file as if you were using html script tags
 * The logic comes from https://usehooks.com/useScript/
 * @param src source url of the script you intend to load
 * @param options setStatus - a react state set function so that the hook's state can be updated; location - placement of the script in document
 * @returns Promise
 */
export const loadScript = (
  src: string,
  options?: ScriptOptions,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Allow falsy src value if waiting on other data needed for
    // constructing the script URL passed to this hook.
    if (!src) {
      options?.setStatus?.('idle');
      return resolve({ status: 'idle' });
    }
    // Fetch existing script element by src
    // It may have been added by another instance of this hook
    let script = document.querySelector(
      `script[src='${src}']`,
    ) as HTMLScriptElement;
    if (!script) {
      // Create script
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.setAttribute('data-status', 'loading');

      script.onload = (event: any) => {
        script.setAttribute('data-status', 'ready');
        setStateFromEvent(event);
        resolve({ status: 'ready' });
      };
      script.onerror = (event: any) => {
        script.setAttribute('data-status', 'error');
        setStateFromEvent(event);
        reject({
          message: `Failed to load script with src ${src}`,
          status: 'error',
        });
      };

      // Add script to document; default to body
      if (options?.location === 'head') {
        document.head.appendChild(script);
      } else {
        document.body.appendChild(script);
      }
    } else {
      // Grab existing script status from attribute and set to state.
      const existingStatus = script.getAttribute('data-status') as ScriptStatus;
      options?.setStatus?.(existingStatus);
      resolve({ status: existingStatus });
    }
    // Script event handler to update status in state
    // Note: Even if the script already exists we still need to add
    // event handlers to update the state for *this* hook instance.
    const setStateFromEvent = (event: any) => {
      options?.setStatus?.(event.type === 'load' ? 'ready' : 'error');
    };
  });
};

/**
 * useScript is a hook that will load your src script for a React component
 * @param src the source URL of your JS script
 * @param location the placement of the script in document
 * @returns {ScriptStatus} the status of the script you are loading
 */
export const useScript = (
  src: string,
  location?: ScriptLocation,
): ScriptStatus => {
  const [status, setStatus] = useState<ScriptStatus>(src ? 'loading' : 'idle');

  useEffect(() => {
    (async () => {
      try {
        await loadScript(src, { location, setStatus });
      } catch (e) {} // Handle errors where useScript is called.
    })();
  }, [src]);

  return status;
};

/**
 * useLazyScript is a hook that will load your src
 * script upon a call to load for a React component
 * @param src the source URL of your JS script
 * @param location the placement of the script in document
 * @returns an object containing the status and the function you can call to start loading the script
 */
export const useLazyScript = (
  src: string,
  location?: ScriptLocation,
): {
  load: () => void;
  status: ScriptStatus;
} => {
  const [status, setStatus] = useState(src ? 'loading' : 'idle');

  return {
    load: () => loadScript(src, { location, setStatus }),
    status: status as ScriptStatus,
  };
};
