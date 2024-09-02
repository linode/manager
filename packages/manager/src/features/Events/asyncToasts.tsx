import { getEventMessage } from './utils';

import type { Event, EventAction } from '@linode/api-v4';

interface ToastMessage {
  /**
   * If true, the toast will be displayed with an error variant for success messages \
   * or a success variant for error messages.
   */
  invertVariant?: boolean;
  message: ((event: Event) => JSX.Element | null | string | undefined) | string;
  persist?: boolean;
}

interface Toast {
  failure?: ToastMessage;
  success?: ToastMessage;
}

type Toasts = {
  [key in EventAction]?: Toast;
};

interface ToastOption {
  invertVariant?: boolean;
  persist?: boolean;
}

interface ToastOptionsBase {
  failure?: ToastOption | boolean;
  success?: ToastOption | boolean;
}

/**
 * To ensure that at least one of failure or success is provided while keeping both optional.
 */
type ToastOptions =
  | (ToastOptionsBase & { failure: ToastOption | boolean })
  | (ToastOptionsBase & { success: ToastOption | boolean });

const createToast = (options: ToastOptions) => {
  const toastConfig: Toast = {};

  if (options.failure) {
    toastConfig.failure = {
      invertVariant:
        typeof options.failure !== 'boolean'
          ? options.failure.invertVariant
          : false,
      message: (e) => getEventMessage(e),
      persist:
        typeof options.failure !== 'boolean' ? options.failure.persist : false,
    };
  }

  if (options.success) {
    toastConfig.success = {
      invertVariant:
        typeof options.success !== 'boolean'
          ? options.success.invertVariant
          : false,
      message: (e) => getEventMessage(e),
      persist:
        typeof options.success !== 'boolean' ? options.success.persist : false,
    };
  }

  return toastConfig;
};

/**
 * This constant defines toast notifications that will be displayed
 * when our events polling system gets a new event.
 *
 * Use this feature to notify users of *asynchronous tasks* such as migrating a Linode.
 *
 * DO NOT use this feature to notify the user of tasks like changing the label of a Linode.
 * Toasts for that can be handled at the time of making the PUT request.
 */
export const toasts: Toasts = {
  backups_restore: createToast({ failure: { persist: true } }),
  disk_delete: createToast({ failure: false, success: true }),
  disk_imagize: createToast({ failure: { persist: true }, success: true }),
  disk_resize: createToast({ failure: { persist: true }, success: true }),
  image_delete: createToast({ failure: true, success: true }),
  image_upload: createToast({ failure: { persist: true }, success: true }),
  linode_clone: createToast({ failure: true, success: true }),
  linode_migrate: createToast({ failure: true, success: true }),
  linode_migrate_datacenter: createToast({ failure: true, success: true }),
  linode_resize: createToast({ failure: true, success: true }),
  linode_snapshot: createToast({ failure: { persist: true } }),
  longviewclient_create: createToast({ failure: true, success: true }),
  tax_id_invalid: createToast({
    failure: { invertVariant: true },
    success: { invertVariant: true, persist: true },
  }),
  volume_attach: createToast({ failure: true, success: true }),
  volume_create: createToast({ failure: true, success: true }),
  volume_delete: createToast({ failure: true, success: true }),
  volume_detach: createToast({ failure: true, success: true }),
  volume_migrate: createToast({ failure: true, success: true }),
};
