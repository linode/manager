import { useBlocker } from '@tanstack/react-router';
import * as React from 'react';

interface UseDiscardChangesProps {
  handleCancelNavigation: () => void;
  handleProceedNavigation: () => void;
  status: 'blocked' | 'idle' | 'proceeding';
}

/**
 * Manages navigation blocking and the discard changes modal.
 *
 * @param dirtyFields - An array of booleans, each indicating whether
 *   a form section has unsaved changes. Navigation is blocked when any
 *   element is truthy.
 */
export const useDiscardChanges = (
  dirtyFields: boolean[]
): UseDiscardChangesProps => {
  const hasUnsavedChanges = dirtyFields.some(Boolean);

  const {
    proceed,
    reset: resetBlocker,
    status,
  } = useBlocker({
    enableBeforeUnload: hasUnsavedChanges,
    shouldBlockFn: ({ next, current }) => {
      if (!hasUnsavedChanges) {
        return false;
      }

      // Allow in-place route updates (e.g. page/pageSize/order/orderBy/query).
      return (
        current.pathname !== next.pathname || current.routeId !== next.routeId
      );
    },
    withResolver: true,
  });

  const handleProceedNavigation = React.useCallback(() => {
    if (status === 'blocked' && proceed) {
      proceed();
    }
  }, [status, proceed]);

  const handleCancelNavigation = React.useCallback(() => {
    if (status === 'blocked' && resetBlocker) {
      resetBlocker();
    }
  }, [status, resetBlocker]);

  return { handleCancelNavigation, handleProceedNavigation, status };
};
