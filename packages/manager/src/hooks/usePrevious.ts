import { useEffect, useRef } from 'react';

/** This hook is from the React docs:
 * https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
 */

export const usePrevious = <T>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
