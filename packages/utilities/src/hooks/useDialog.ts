import * as React from 'react';

import type { APIError } from '@linode/api-v4/lib/types';

export interface DialogState<T> {
  entityID: T;
  entityLabel?: string;
  error?: string;
  isLoading: boolean;
  isOpen: boolean;
}

/**
 * useDialog Hook
 *
 * Created to reuse shared logic for confirmation dialogs.
 * Handles basic shared actions such as setting loading state on
 * submit, opening and closing the dialog, etc.
 *
 * If the action being confirmed is complex, you'll likely need to expand this
 * hook or write custom logic.
 *
 * @example
 *
 * const myRequest = (id: string) => Promise<any>;
 *
 * const {
 *  dialog,
 *  openDialog,
 *  closeDialog,
 *  submitDialog,
 *  handleError
 * } = useDialog<string>(myRequest);
 *
 *
 * @returns
 *
 * dialog object: contains state variables for the dialog
 * open, close handlers: Opening the dialog requires the label
 * and the ID of the entity that the action is going to target.
 *
 * submit handler: Handles updating loading/error states and making
 * the API request. Returns promises so the consumer can chain additional
 * logic on top of these handlers.
 *
 * error handler: Set the dialog error directly. Exposed so that consumers
 * can specify a default error message.
 *
 * @param request
 */

export const useDialog = <T extends number | string | undefined>(
  request: (params?: T) => Promise<any>
): {
  closeDialog: () => void;
  dialog: DialogState<T>;
  handleError: (e: string) => void;
  openDialog: (id: T, label?: string) => void;
  submitDialog: (params: T) => Promise<any>;
} => {
  const [error, setErrors] = React.useState<string | undefined>();
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [entityID, setEntityID] = React.useState<T>(-1 as T);
  const [entityLabel, setEntityLabel] = React.useState<string>('');

  const mountedRef = React.useRef<boolean>(true);

  const submitDialog = (params: T) => {
    setErrors(undefined);
    setLoading(true);
    return request(params)
      .then((response) => {
        if (!mountedRef.current) {
          return;
        }
        handleSuccess();
        return response;
      })
      .catch((e: APIError[]) => {
        if (!mountedRef.current) {
          return;
        }

        /**
         * This sets the error to whatever the API returns.
         * Consumers can use the exposed handleError method
         * directly if they want to override this with a custom message.
         */
        handleError(e[0].reason);
        return Promise.reject(e);
      });
  };

  const openDialog = (id: T, label: string = '') => {
    setEntityLabel(label);
    setEntityID(id);
    setErrors(undefined);
    setLoading(false);
    setOpen(true);
  };

  const handleSuccess = () => {
    setErrors(undefined);
    setLoading(false);
    setOpen(false);
  };

  const handleError = (e: string) => {
    setErrors(e);
    setLoading(false);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    closeDialog,
    dialog: { entityID, entityLabel, error, isLoading, isOpen },
    handleError,
    openDialog,
    submitDialog,
  };
};
