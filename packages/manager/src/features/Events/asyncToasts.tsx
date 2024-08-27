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
  backups_restore: {
    failure: {
      message: (e) => getEventMessage(e),
      persist: true,
    },
  },
  disk_delete: {
    failure: {
      message: (e) => getEventMessage(e),
    },
    success: {
      message: (e) => getEventMessage(e),
    },
  },
  disk_imagize: {
    failure: {
      message: (e) => getEventMessage(e),
      persist: true,
    },
    success: {
      message: (e) => getEventMessage(e),
    },
  },
  disk_resize: {
    failure: {
      message: (e) => getEventMessage(e),
      persist: true,
    },
    success: {
      message: (e) => getEventMessage(e),
    },
  },
  image_delete: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  image_upload: {
    failure: {
      message: (e) => getEventMessage(e),
      persist: true,
    },
    success: { message: (e) => getEventMessage(e) },
  },
  linode_clone: {
    failure: { message: (e) => getEventMessage(e) },
    success: {
      message: (e) => getEventMessage(e),
    },
  },
  linode_migrate: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  linode_migrate_datacenter: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  linode_resize: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  linode_snapshot: {
    failure: {
      message: (e) => getEventMessage(e),
      persist: true,
    },
  },
  longviewclient_create: {
    failure: {
      message: (e) => getEventMessage(e),
    },
    success: {
      message: (e) => getEventMessage(e),
    },
  },
  tax_id_invalid: {
    failure: { message: (e) => getEventMessage(e) },
    invertVariant: true,
    success: {
      message: (e) => getEventMessage(e),
      persist: true,
    },
  },
  volume_attach: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  volume_create: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  volume_delete: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  volume_detach: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
  volume_migrate: {
    failure: { message: (e) => getEventMessage(e) },
    success: { message: (e) => getEventMessage(e) },
  },
};
