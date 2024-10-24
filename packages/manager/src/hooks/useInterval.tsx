import { useCallback, useEffect, useRef } from 'react';

interface UseIntervalOptions {
  /**
   * The function to call on each interval.
   */
  callback: () => void;
  /**
   * If true, the interval will be canceled if the callback throws an error.
   */
  cancelOnError?: boolean;
  /**
   * The delay in milliseconds between each interval.
   */
  delay?: number;
  /**
   * If true, errors thrown by the callback will be silenced.
   */
  silenceError?: boolean;
  /**
   * If true, the interval will start immediately.
   */
  startImmediately?: boolean;
  /**
   * If true, the interval will run when the condition is true.
   */
  when?: boolean;
}

interface UseIntervalReturn {
  /**
   * Cancels the interval.
   */
  cancel: () => void;
  /**
   * Reference to the interval timer.
   */
  intervalRef: React.MutableRefObject<number | undefined>;
}

const useInterval = ({
  callback,
  cancelOnError = true,
  delay = 1000,
  silenceError = false,
  startImmediately = false,
  when = true,
}: UseIntervalOptions): UseIntervalReturn => {
  const intervalRef = useRef<number | undefined>();

  // Save the callback to a ref to ensure it has the most recent version
  // without needing to reset the interval each time the callback changes.
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);

      // Optionally clear the ref after stopping the interval
      intervalRef.current = undefined;
    }
  }, []);

  const tick = useCallback(() => {
    try {
      savedCallback.current();
    } catch (error) {
      if (!silenceError) {
        throw error;
      }
      if (cancelOnError) {
        clearTimer();
      }
    }
  }, [silenceError, cancelOnError, clearTimer]);

  useEffect(() => {
    if (when) {
      if (startImmediately) {
        tick();
      }

      intervalRef.current = window.setInterval(tick, delay);

      return clearTimer;
    }

    // Ensure the cleanup function is properly defined for all paths.
    return clearTimer;
  }, [tick, delay, when, startImmediately, clearTimer]);

  // Return the intervalRef and a method to programmatically cancel the interval
  return { cancel: clearTimer, intervalRef };
};

export { useInterval };
