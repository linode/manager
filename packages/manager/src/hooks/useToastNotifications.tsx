import { Event, EventAction } from '@linode/api-v4/lib/account/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { sendLinodeDiskEvent } from 'src/utilities/analytics';

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

interface Toast {
  failure?: ((event: Event) => string | undefined) | string;
  link?: JSX.Element;
  persistFailureMessage?: boolean;
  success?: ((event: Event) => string | undefined) | string;
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
 * DO NOT use this feature to notifiy the user of tasks like changing the label of a Linode.
 * Toasts for that can be handeled at the time of making the PUT request.
 */
const toasts: Toasts = {
  backups_restore: {
    failure: (e) => `Backup restoration failed for ${getLabel(e)}.`,
    link: formatLink(
      'Learn more about limits and considerations.',
      'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
    ),
    persistFailureMessage: true,
  },
  disk_delete: {
    failure: (e) =>
      `Unable to delete disk ${getSecondaryLabel(e)} ${
        getLabel(e) ? ` on ${getLabel(e)}` : ''
      }. Is it attached to a configuration profile that is in use?`,
    success: (e) => `Disk ${getSecondaryLabel(e)} successfully deleted.`,
  },
  disk_imagize: {
    failure: (e) =>
      `There was a problem creating Image ${getSecondaryLabel(e)}.`,
    link: formatLink(
      'Learn more about image technical specifications.',
      'https://www.linode.com/docs/products/tools/images/#technical-specifications'
    ),
    persistFailureMessage: true,
    success: (e) => `Image ${getSecondaryLabel(e)} successfully created.`,
  },
  disk_resize: {
    failure: `Disk resize failed.`,
    link: formatLink(
      'Learn more about resizing restrictions.',
      'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/',
      () =>
        sendLinodeDiskEvent('Resize', 'Click:link', 'Disk resize failed toast')
    ),
    persistFailureMessage: true,
    success: (e) => `Disk ${getSecondaryLabel(e)} successfully resized.`,
  },
  image_delete: {
    failure: (e) => `Error deleting Image ${getLabel(e)}.`,
    success: (e) => `Image ${getLabel(e)} successfully deleted.`,
  },
  image_upload: {
    failure(event) {
      const isDeletion = event.message === 'Upload canceled.';

      if (isDeletion) {
        return undefined;
      }

      return `There was a problem uploading image ${getLabel(
        event
      )}: ${event.message?.replace(/(\d+)/g, '$1 MB')}`;
    },
    persistFailureMessage: true,
    success: (e) => `Image ${getLabel(e)} is now available.`,
  },
  linode_clone: {
    failure: (e) => `Error cloning Linode ${getLabel(e)}.`,
    success: (e) =>
      `Linode ${getLabel(e)} successfully cloned to ${getSecondaryLabel(e)}.`,
  },
  linode_migrate: {
    failure: (e) => `Error migrating Linode ${getLabel(e)}.`,
    success: (e) => `Linode ${getLabel(e)} successfully migrated.`,
  },
  linode_migrate_datacenter: {
    failure: (e) => `Error migrating Linode ${getLabel(e)}.`,
    success: (e) => `Linode ${getLabel(e)} successfully migrated.`,
  },
  linode_resize: {
    failure: (e) => `Error resizing Linode ${getLabel(e)}.`,
    success: (e) => `Linode ${getLabel(e)} successfully resized.`,
  },
  linode_snapshot: {
    failure: (e) => `Snapshot backup failed on Linode ${getLabel(e)}.`,
    link: formatLink(
      'Learn more about limits and considerations.',
      'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
    ),
    persistFailureMessage: true,
  },
  longviewclient_create: {
    failure: (e) => `Error creating Longview Client ${getLabel(e)}.`,
    success: (e) => `Longview Client ${getLabel(e)} successfully created.`,
  },
  volume_attach: {
    failure: (e) => `Error attaching Volume ${getLabel(e)}.`,
    success: (e) => `Volume ${getLabel(e)} successfully attached.`,
  },
  volume_create: {
    failure: (e) => `Error creating Volume ${getLabel(e)}.`,
    success: (e) => `Volume ${getLabel(e)} successfully created.`,
  },
  volume_delete: {
    failure: 'Error deleting Volume.',
    success: 'Volume successfully deleted.',
  },
  volume_detach: {
    failure: (e) => `Error detaching Volume ${getLabel(e)}.`,
    success: (e) => `Volume ${getLabel(e)} successfully detached.`,
  },
};

export const useToastNotifications = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleGlobalToast = (event: Event) => {
    const toastInfo = toasts[event.action];

    if (!toastInfo) {
      return;
    }

    if (
      ['finished', 'notification'].includes(event.status) &&
      toastInfo.success
    ) {
      const successMessage =
        typeof toastInfo.success === 'function'
          ? toastInfo.success(event)
          : toastInfo.success;

      enqueueSnackbar(successMessage, {
        variant: 'success',
      });
    }

    if (event.status === 'failed' && toastInfo.failure) {
      const failureMessage =
        typeof toastInfo.failure === 'function'
          ? toastInfo.failure(event)
          : toastInfo.failure;

      const hasSupportLink =
        failureMessage?.includes('contact Support') ?? false;

      const formattedFailureMessage = (
        <>
          {failureMessage?.replace(/ contact Support/i, '') ?? failureMessage}
          {hasSupportLink ? (
            <>
              &nbsp;
              <SupportLink text="contact Support" title={failureMessage} />.
            </>
          ) : null}
          {toastInfo.link ? <>&nbsp;{toastInfo.link}</> : null}
        </>
      );

      enqueueSnackbar(formattedFailureMessage, {
        persist: toastInfo.persistFailureMessage,
        variant: 'error',
      });
    }
  };

  return { handleGlobalToast };
};
