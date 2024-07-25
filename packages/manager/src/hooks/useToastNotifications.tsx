import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';
import { sendLinodeDiskEvent } from 'src/utilities/analytics/customEventAnalytics';

import type { Event, EventAction } from '@linode/api-v4';

export const getLabel = (event: Event) => event.entity?.label ?? '';
export const getSecondaryLabel = (event: Event) =>
  event.secondary_entity?.label ?? '';
const formatLink = (text: string, link: string, handleClick?: () => void) => {
  return (
    <Link onClick={handleClick} to={link}>
      {text}
    </Link>
  );
};

interface ToastMessage {
  link?: JSX.Element;
  message: ((event: Event) => string | undefined) | string;
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
const toasts: Toasts = {
  backups_restore: {
    failure: {
      link: formatLink(
        'Learn more about limits and considerations.',
        'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
      ),
      message: (e) => `Backup restoration failed for ${getLabel(e)}.`,
      persist: true,
    },
  },
  disk_delete: {
    failure: {
      message: (e) =>
        `Unable to delete disk ${getSecondaryLabel(e)} ${
          getLabel(e) ? ` on ${getLabel(e)}` : ''
        }. Is it attached to a configuration profile that is in use?`,
    },
    success: {
      message: (e) => `Disk ${getSecondaryLabel(e)} successfully deleted.`,
    },
  },
  disk_imagize: {
    failure: {
      link: formatLink(
        'Learn more about image technical specifications.',
        'https://www.linode.com/docs/products/tools/images/#technical-specifications'
      ),
      message: (e) =>
        `There was a problem creating Image ${getSecondaryLabel(e)}.`,
      persist: true,
    },

    success: {
      message: (e) => `Image ${getSecondaryLabel(e)} successfully created.`,
    },
  },
  disk_resize: {
    failure: {
      link: formatLink(
        'Learn more about resizing restrictions.',
        'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/',
        () =>
          sendLinodeDiskEvent(
            'Resize',
            'Click:link',
            'Disk resize failed toast'
          )
      ),
      message: `Disk resize failed.`,
      persist: true,
    },
    success: {
      message: (e) => `Disk ${getSecondaryLabel(e)} successfully resized.`,
    },
  },
  image_delete: {
    failure: { message: (e) => `Error deleting Image ${getLabel(e)}.` },
    success: { message: (e) => `Image ${getLabel(e)} successfully deleted.` },
  },
  image_upload: {
    failure: {
      message: (e) => {
        const isDeletion = e.message === 'Upload canceled.';

        if (isDeletion) {
          return undefined;
        }

        return `There was a problem uploading image ${getLabel(
          e
        )}: ${e.message?.replace(/(\d+)/g, '$1 MB')}`;
      },
      persist: true,
    },
    success: { message: (e) => `Image ${getLabel(e)} is now available.` },
  },
  linode_clone: {
    failure: { message: (e) => `Error cloning Linode ${getLabel(e)}.` },
    success: {
      message: (e) =>
        `Linode ${getLabel(e)} successfully cloned to ${getSecondaryLabel(e)}.`,
    },
  },
  linode_migrate: {
    failure: { message: (e) => `Error migrating Linode ${getLabel(e)}.` },
    success: { message: (e) => `Linode ${getLabel(e)} successfully migrated.` },
  },
  linode_migrate_datacenter: {
    failure: { message: (e) => `Error migrating Linode ${getLabel(e)}.` },
    success: { message: (e) => `Linode ${getLabel(e)} successfully migrated.` },
  },
  linode_resize: {
    failure: { message: (e) => `Error resizing Linode ${getLabel(e)}.` },
    success: { message: (e) => `Linode ${getLabel(e)} successfully resized.` },
  },
  linode_snapshot: {
    failure: {
      link: formatLink(
        'Learn more about limits and considerations.',
        'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
      ),
      message: (e) => `Snapshot backup failed on Linode ${getLabel(e)}.`,
      persist: true,
    },
  },
  longviewclient_create: {
    failure: {
      message: (e) => `Error creating Longview Client ${getLabel(e)}.`,
    },
    success: {
      message: (e) => `Longview Client ${getLabel(e)} successfully created.`,
    },
  },
  tax_id_invalid: {
    failure: { message: 'Error validating Tax Identification Number.' },
    invertVariant: true,
    success: {
      message:
        'Tax Identification Number could not be verified. Please check your Tax ID for accuracy or contact support for assistance.',
      persist: true,
    },
  },
  volume_attach: {
    failure: { message: (e) => `Error attaching Volume ${getLabel(e)}.` },
    success: { message: (e) => `Volume ${getLabel(e)} successfully attached.` },
  },
  volume_create: {
    failure: { message: (e) => `Error creating Volume ${getLabel(e)}.` },
    success: { message: (e) => `Volume ${getLabel(e)} successfully created.` },
  },
  volume_delete: {
    failure: { message: 'Error deleting Volume.' },
    success: { message: 'Volume successfully deleted.' },
  },
  volume_detach: {
    failure: { message: (e) => `Error detaching Volume ${getLabel(e)}.` },
    success: { message: (e) => `Volume ${getLabel(e)} successfully detached.` },
  },
  volume_migrate: {
    failure: { message: (e) => `Error upgrading Volume ${getLabel(e)}.` },
    success: { message: (e) => `Volume ${getLabel(e)} successfully upgraded.` },
  },
};

const getToastMessage = (
  toastMessage: ((event: Event) => string | undefined) | string,
  event: Event
): string | undefined =>
  typeof toastMessage === 'function' ? toastMessage(event) : toastMessage;

const createFormattedMessage = (
  message: string | undefined,
  link: JSX.Element | undefined,
  hasSupportLink: boolean
) => (
  <Typography>
    {message?.replace(/ contact Support/i, '') ?? message}
    {hasSupportLink && (
      <>
        &nbsp;
        <SupportLink text="contact Support" title={message} />.
      </>
    )}
    {link && <>&nbsp;{link}</>}
  </Typography>
);

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
      const { link, message, persist } = toastInfo.success;
      const successMessage = getToastMessage(message, event);

      if (successMessage) {
        const formattedSuccessMessage = createFormattedMessage(
          successMessage,
          link,
          false
        );

        enqueueSnackbar(formattedSuccessMessage, {
          persist: persist ?? false,
          variant: toastInfo.invertVariant ? 'error' : 'success',
        });
      }
    }

    if (event.status === 'failed' && toastInfo.failure) {
      const { link, message, persist } = toastInfo.failure;
      const failureMessage = getToastMessage(message, event);

      if (failureMessage) {
        const hasSupportLink = failureMessage
          .toLowerCase()
          .includes('contact support');

        const formattedFailureMessage = createFormattedMessage(
          failureMessage,
          link,
          hasSupportLink
        );

        enqueueSnackbar(formattedFailureMessage, {
          persist: persist ?? false,
          variant: toastInfo.invertVariant ? 'success' : 'error',
        });
      }
    }
  };

  return { handleGlobalToast };
};
