import { getEventMessage } from './utils';

import type { Event, EventAction } from '@linode/api-v4';

interface ToastMessage {
  message: ((event: Event) => JSX.Element | null | string | undefined) | string;
  persist?: boolean;
}

interface Toast {
  failure?: ToastMessage;
  /**
   * If true, the toast will be displayed with an error variant.
   */
  invertVariant?: boolean;
  success?: ToastMessage;
}

type Toasts = {
  [key in EventAction]?: Toast;
};

const createToastBoth = (
  options: {
    invertVariant?: boolean;
    persistFailure?: boolean;
    persistSuccess?: boolean;
  } = {}
): Toast => ({
  failure: {
    message: (e) => getEventMessage(e),
    persist: options.persistFailure || false,
  },
  invertVariant: options.invertVariant || false,
  success: {
    message: (e: any) => getEventMessage(e),
    persist: options.persistSuccess || false,
  },
});

const createToastFailureOnly = (
  options: {
    invertVariant?: boolean;
    persistFailure?: boolean;
  } = {}
): Toast => ({
  failure: {
    message: (e) => getEventMessage(e),
    persist: options.persistFailure || false,
  },
  invertVariant: options.invertVariant || false,
});

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
  backups_restore: createToastFailureOnly({ persistFailure: true }),
  disk_delete: createToastBoth(),
  disk_imagize: createToastBoth({ persistFailure: true }),
  disk_resize: createToastBoth({ persistFailure: true }),
  image_delete: createToastBoth(),
  image_upload: createToastBoth({ persistFailure: true }),
  linode_clone: createToastBoth(),
  linode_migrate: createToastBoth(),
  linode_migrate_datacenter: createToastBoth(),
  linode_resize: createToastBoth(),
  linode_snapshot: createToastFailureOnly({ persistFailure: true }),
  longviewclient_create: createToastBoth(),
  tax_id_invalid: createToastBoth({
    invertVariant: true,
    persistSuccess: true,
  }),
  volume_attach: createToastBoth(),
  volume_create: createToastBoth(),
  volume_delete: createToastBoth(),
  volume_detach: createToastBoth(),
  volume_migrate: createToastBoth(),
};
