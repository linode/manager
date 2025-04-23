import { useSnackbar } from 'notistack';

import { toasts } from 'src/features/Events/asyncToasts';

import type { Event } from '@linode/api-v4';

export const getLabel = (event: Event) => event.entity?.label ?? '';
export const getSecondaryLabel = (event: Event) =>
  event.secondary_entity?.label ?? '';

const getToastMessage = (
  toastMessage:
    | ((event: Event) => JSX.Element | null | string | undefined)
    | string,
  event: Event
): JSX.Element | null | string | undefined =>
  typeof toastMessage === 'function' ? toastMessage(event) : toastMessage;

export const useToastNotifications = (): {
  handleGlobalToast: (event: Event) => void;
} => {
  const { enqueueSnackbar } = useSnackbar();

  const handleGlobalToast = (event: Event): void => {
    const toastInfo = toasts[event.action];
    if (!toastInfo) {
      return;
    }

    const isSuccessEvent = ['finished', 'notification'].includes(event.status);

    if (isSuccessEvent && toastInfo.success) {
      const { invertVariant, message, persist } = toastInfo.success;
      const successMessage = getToastMessage(message, event);

      if (successMessage) {
        enqueueSnackbar(successMessage, {
          persist: persist ?? false,
          variant: invertVariant ? 'error' : 'success',
        });
      }
    }

    if (event.status === 'failed' && toastInfo.failure) {
      const { invertVariant, message, persist } = toastInfo.failure;
      const failureMessage = getToastMessage(message, event);

      if (failureMessage) {
        enqueueSnackbar(failureMessage, {
          persist: persist ?? false,
          variant: invertVariant ? 'success' : 'error',
        });
      }
    }
  };

  return { handleGlobalToast };
};
