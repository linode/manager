import {
  loadScript,
  ScriptLocation,
  ScriptStatus,
} from '@akamai/compute-ui-core/browser';
import { useEffect, useState } from 'react';

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
