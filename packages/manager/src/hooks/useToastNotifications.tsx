import { EventAction, EventStatus } from '@linode/api-v4/lib/account/types';
import { styled } from '@mui/material/styles';
import { WithSnackbarProps, useSnackbar } from 'notistack';
import React from 'react';
import { Link } from 'react-router-dom';

import { SupportLink } from 'src/components/SupportLink';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { sendLinodeDiskEvent } from 'src/utilities/analytics';

export const useToastNotifications = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEventsInfiniteQuery({
    eventHandler: (event) => {
      const label = event.entity?.label ?? '';
      const secondaryLabel = event.secondary_entity?.label ?? '';

      const eventToasts: Partial<
        Record<
          EventAction,
          Pick<
            ToastOptions,
            | 'failureMessage'
            | 'link'
            | 'persistFailureMessage'
            | 'persistSuccessMessage'
            | 'successMessage'
          >
        >
      > = {
        backups_restore: {
          failureMessage: `Backup restoration failed for ${label}.`,
          link: formatLink(
            'Learn more about limits and considerations.',
            'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
          ),
          persistFailureMessage: true,
        },
        disk_delete: {
          failureMessage: `Unable to delete disk ${secondaryLabel} ${
            label ? ` on ${label}` : ''
          }. Is it attached to a configuration profile that is in use?`,
          successMessage: `Disk ${secondaryLabel} deleted successfully.`,
        },
        disk_imagize: {
          failureMessage: `There was a problem creating Image ${secondaryLabel}.`,
          link: formatLink(
            'Learn more about image technical specifications.',
            'https://www.linode.com/docs/products/tools/images/#technical-specifications'
          ),
          persistFailureMessage: true,
          successMessage: `Image ${secondaryLabel} created successfully.`,
        },
        disk_resize: {
          failureMessage: `Disk resize failed.`,
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
          persistFailureMessage: true,
          successMessage: `Disk ${secondaryLabel} resized successfully.`,
        },
        image_delete: {
          failureMessage: `Error deleting Image ${label}.`,
          successMessage: `Image ${label} deleted successfully.`,
        },
        image_upload: {
          failureMessage:
            event.message === 'Upload canceled.'
              ? undefined
              : `There was a problem uploading image ${label}: ${event.message?.replace(
                  /(\d+)/g,
                  '$1 MB'
                )}`,
          persistFailureMessage: true,
          successMessage: `Image ${label} is now available.`,
        },
        linode_snapshot: {
          failureMessage: `Snapshot backup failed on Linode ${label}.`,
          link: formatLink(
            'Learn more about limits and considerations.',
            'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
          ),
          persistFailureMessage: true,
        },
        volume_attach: {
          failureMessage: `Error attaching Volume ${label}.`,
          successMessage: `Volume ${label} successfully attached.`,
        },
        volume_create: {
          failureMessage: `Error creating Volume ${label}.`,
          successMessage: `Volume ${label} successfully created.`,
        },
        volume_delete: {
          failureMessage: `Error deleting Volume.`,
          successMessage: `Volume successfully deleted.`,
        },
        volume_detach: {
          failureMessage: `Error detaching Volume ${label}.`,
          successMessage: `Volume ${label} successfully detached.`,
        },

        /**
         * These create/delete failures are hypothetical.
         * We don't know if it's possible for these to fail,
         * but are including handling to be safe.
         */
        // eslint-disable-next-line perfectionist/sort-objects
        firewall_delete: {
          failureMessage: `Error deleting Firewall ${label}.`,
        },
        firewall_device_add: {
          failureMessage: `Error adding ${secondaryLabel} to Firewall ${label}.`,
        },
        firewall_device_remove: {
          failureMessage: `Error removing ${secondaryLabel} from Firewall ${label}.`,
        },
        firewall_disable: {
          failureMessage: `Error disabling Firewall ${label}.`,
        },
        firewall_enable: {
          failureMessage: `Error enabling Firewall ${label}.`,
        },
        linode_clone: {
          failureMessage: `Error cloning Linode ${label}.`,
          successMessage: `Linode ${label} has been cloned successfully to ${secondaryLabel}.`,
        },
        linode_config_create: {
          failureMessage: `Error creating config ${secondaryLabel}.`,
        },
        linode_config_delete: {
          failureMessage: `Error deleting config ${secondaryLabel}.`,
        },
        linode_migrate: {
          failureMessage: `Linode ${label} migration failed.`,
          successMessage: `Linode ${label} migrated successfully.`,
        },
        linode_migrate_datacenter: {
          failureMessage: `Error migrating Linode ${label}.`,
          successMessage: `Linode ${label} has been migrated successfully.`,
        },
        linode_resize: {
          failureMessage: `Error resizing Linode ${label}.`,
          successMessage: `Linode ${label} has been resized successfully.`,
        },
        longviewclient_create: {
          failureMessage: `Error creating Longview Client ${label}.`,
          successMessage: `Longview Client ${label} successfully created.`,
        },
      };

      const toast = eventToasts[event.action];
      if (toast) {
        toastSuccessAndFailure({
          ...toast,
          enqueueSnackbar,
          eventStatus: event.status,
        });
      }
    },
  });
};

interface ToastOptions {
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'];
  eventStatus: EventStatus;
  failureMessage?: string;
  link?: JSX.Element;
  persistFailureMessage?: boolean;
  persistSuccessMessage?: boolean;
  successMessage?: string;
}

const toastSuccessAndFailure = (options: ToastOptions) => {
  const {
    enqueueSnackbar,
    eventStatus,
    failureMessage,
    link,
    persistFailureMessage,
    persistSuccessMessage,
    successMessage,
  } = options;
  let formattedFailureMessage;

  if (
    ['finished', 'notification'].includes(eventStatus) &&
    Boolean(successMessage)
  ) {
    return enqueueSnackbar(successMessage, {
      persist: persistSuccessMessage,
      variant: 'success',
    });
  } else if (['failed'].includes(eventStatus) && Boolean(failureMessage)) {
    const hasSupportLink = failureMessage?.includes('contact Support') ?? false;
    formattedFailureMessage = (
      <>
        {failureMessage?.replace(/ contact Support/i, '') ?? failureMessage}
        {hasSupportLink ? (
          <>
            &nbsp;
            <SupportLink text="contact Support" title={failureMessage} />.
          </>
        ) : null}
        {link ? <>&nbsp;{link}</> : null}
      </>
    );

    return enqueueSnackbar(formattedFailureMessage ?? failureMessage, {
      persist: persistFailureMessage,
      variant: 'error',
    });
  } else {
    return;
  }
};

const formatLink = (text: string, link: string, handleClick?: any) => {
  return (
    <StyledToastNotificationLink onClick={handleClick} to={link}>
      {text}
    </StyledToastNotificationLink>
  );
};

export const StyledToastNotificationLink = styled(Link, {
  label: 'StyledToastNotificationLink',
})(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
}));
