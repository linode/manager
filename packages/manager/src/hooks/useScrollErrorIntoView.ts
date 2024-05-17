import { useEffect, useRef } from 'react';

/**
 * This hook is used to scroll the first error message into view when it is rendered.
 * It is meant to be used directly in the component we want to scroll into view (ex: `<TextField />`).
 *
 * @param errorText A string that represents the error message to be displayed.
 * @returns A ref that should be attached to the component we want to scroll into view.
 */

// Global state to store the ID of the first error. It's defined outside of the hook to persist across renders.
let firstErrorId: null | number = null;

// Counter to generate unique IDs for each instance of the hook. Also defined outside of the hook for the same reason.
let refIdCounter = 0;

export const useScrollErrorIntoView = <T extends HTMLElement>(
  error: boolean | string | undefined,
  disabledScrollToError?: boolean
) => {
  const ref = useRef<T>(null);

  // Generate a unique ID for each instance of the hook.
  // The ID is stored in a ref to persist across renders.
  const id = useRef(refIdCounter++).current;

  useEffect(() => {
    if (disabledScrollToError) {
      return;
    }

    if (error) {
      // If this is the first error (i.e., firstErrorId is null), store its ID in firstErrorId.
      if (firstErrorId === null) {
        firstErrorId = id;
      }

      // If the current instance of the hook is the first one to encounter an error, scroll its component into view.
      if (ref.current && firstErrorId === id) {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }

    // When the component unmounts, reset firstErrorId and refIdCounter to their initial values.
    // This prevents memory leaks and ensures that the hook behaves correctly when used in multiple components on the same page.
    return () => {
      firstErrorId = null;
      refIdCounter = 0;
    };
  }, [disabledScrollToError, error, id]);

  return ref;
};
