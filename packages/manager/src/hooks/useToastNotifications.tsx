import { Event, EventStatus } from '@linode/api-v4/lib/account/types';
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
      const label = getLabel(event);
      const secondaryLabel = getSecondaryLabel(event);
      switch (event.action) {
        case 'volume_attach':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Volume ${label} successfully attached.`,
            failureMessage: `Error attaching Volume ${label}.`,
          });
          break;
        case 'volume_detach':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Volume ${label} successfully detached.`,
            failureMessage: `Error detaching Volume ${label}.`,
          });
        case 'volume_create':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Volume ${label} successfully created.`,
            failureMessage: `Error creating Volume ${label}.`,
          });
        case 'volume_delete':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Volume successfully deleted.`,
            failureMessage: `Error deleting Volume.`,
          });
        case 'disk_imagize':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            persistFailureMessage: true,
            successMessage: `Image ${secondaryLabel} created successfully.`,
            failureMessage: `There was a problem creating Image ${secondaryLabel}.`,
            link: formatLink(
              'Learn more about image technical specifications.',
              'https://www.linode.com/docs/products/tools/images/#technical-specifications'
            ),
          });
        case 'disk_resize':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            persistFailureMessage: true,
            successMessage: `Disk ${secondaryLabel} resized successfully.`,
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
          });
        case 'image_upload':
          const isDeletion = event.message === 'Upload cancelled.';
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            persistFailureMessage: true,
            successMessage: `Image ${label} is now available.`,
            failureMessage: isDeletion
              ? undefined
              : `There was a problem uploading image ${label}: ${event.message
                  ?.replace('cancelled', 'canceled')
                  .replace(/(\d+)/g, '$1 MB')}`,
          });
          break;
        case 'image_delete':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Image ${label} deleted successfully.`,
            failureMessage: `Error deleting Image ${label}.`,
          });
          break;
        case 'disk_delete':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Disk ${secondaryLabel} deleted successfully.`,
            failureMessage: `Unable to delete disk ${secondaryLabel} ${
              label ? ` on ${label}` : ''
            }. Is it attached to a configuration profile that is in use?`,
          });
          break;
        case 'linode_snapshot':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `There was an error creating a snapshot on Linode ${label}.`,
          });
          break;
        /**
         * These create/delete failures are hypothetical.
         * We don't know if it's possible for these to fail,
         * but are including handling to be safe.
         */
        case 'linode_config_delete':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error deleting config ${secondaryLabel}.`,
          });
          break;
        case 'linode_config_create':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error creating config ${secondaryLabel}.`,
          });
          break;
        case 'linode_clone':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Linode ${label} has been cloned successfully to ${secondaryLabel}.`,
            failureMessage: `Error cloning Linode ${label}.`,
          });
          break;
        case 'linode_migrate_datacenter':
        case 'linode_migrate':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Linode ${label} has been migrated successfully.`,
            failureMessage: `Error migrating Linode ${label}.`,
          });
          break;
        case 'linode_resize':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Linode ${label} has been resized successfully.`,
            failureMessage: `Error resizing Linode ${label}.`,
          });
          break;
        case 'firewall_enable':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error enabling Firewall ${label}.`,
          });
          break;
        case 'firewall_disable':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error disabling Firewall ${label}.`,
          });
          break;
        case 'firewall_delete':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error deleting Firewall ${label}.`,
          });
          break;
        case 'firewall_device_add':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error adding ${secondaryLabel} to Firewall ${label}.`,
          });
          break;
        case 'firewall_device_remove':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            failureMessage: `Error removing ${secondaryLabel} from Firewall ${label}.`,
          });
          break;
        case 'longviewclient_create':
          toastSuccessAndFailure({
            enqueueSnackbar,
            eventStatus: event.status,
            successMessage: `Longview Client ${label} successfully created.`,
            failureMessage: `Error creating Longview Client ${label}.`,
          });
          break;
      }
    },
  });
};

interface ToastOptions {
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'];
  eventStatus: EventStatus;
  persistSuccessMessage?: boolean;
  persistFailureMessage?: boolean;
  successMessage?: string;
  failureMessage?: string;
  link?: JSX.Element;
}

const toastSuccessAndFailure = (options: ToastOptions) => {
  const {
    enqueueSnackbar,
    eventStatus,
    persistSuccessMessage,
    persistFailureMessage,
    successMessage,
    failureMessage,
    link,
  } = options;
  let formattedFailureMessage;

  if (
    ['finished', 'notification'].includes(eventStatus) &&
    Boolean(successMessage)
  ) {
    return enqueueSnackbar(successMessage, {
      variant: 'success',
      persist: persistSuccessMessage,
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
      variant: 'error',
      persist: persistFailureMessage,
    });
  } else {
    return;
  }
};

export const getLabel = (event: Event) => event.entity?.label ?? '';
export const getSecondaryLabel = (event: Event) =>
  event.secondary_entity?.label ?? '';

const formatLink = (text: string, link: string, handleClick?: any) => {
  return (
    <Link to={link} onClick={handleClick}>
      {text}
    </Link>
  );
};
