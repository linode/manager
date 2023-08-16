import { Event, EventStatus } from '@linode/api-v4/lib/account/types';
import { WithSnackbarProps, withSnackbar } from 'notistack';
import * as React from 'react';
// import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { events$ } from 'src/events';
import { sendLinodeDiskEvent } from 'src/utilities/analytics';

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

export const getLabel = (event: Event) => event.entity?.label ?? '';
export const getSecondaryLabel = (event: Event) =>
  event.secondary_entity?.label ?? '';

export const ToastNotifications = (props: WithSnackbarProps) => {
  React.useEffect(() => {
    const subscription = events$
      .filter(({ event }) => !event._initial)
      .map(({ event }) => {
        const { enqueueSnackbar } = props;
        const label = getLabel(event);
        const secondaryLabel = getSecondaryLabel(event);
        switch (event.action) {
          case 'volume_attach':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error attaching Volume ${label}.`,
              successMessage: `Volume ${label} successfully attached.`,
            });
          case 'volume_detach':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error detaching Volume ${label}.`,
              successMessage: `Volume ${label} successfully detached.`,
            });
          case 'volume_create':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error creating Volume ${label}.`,
              successMessage: `Volume ${label} successfully created.`,
            });
          case 'volume_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error deleting Volume.`,
              successMessage: `Volume successfully deleted.`,
            });
          case 'disk_imagize':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `There was a problem creating Image ${secondaryLabel}.`,
              link: formatLink(
                'Learn more about image technical specifications.',
                'https://www.linode.com/docs/products/tools/images/#technical-specifications'
              ),
              persistFailureMessage: true,
              successMessage: `Image ${secondaryLabel} created successfully.`,
            });
          case 'disk_resize':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
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
            });
          case 'image_upload':
            const isDeletion = event.message === 'Upload canceled.';
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: isDeletion
                ? undefined
                : `There was a problem uploading image ${label}: ${event.message?.replace(
                    /(\d+)/g,
                    '$1 MB'
                  )}`,
              persistFailureMessage: true,
              successMessage: `Image ${label} is now available.`,
            });
          case 'image_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error deleting Image ${label}.`,
              successMessage: `Image ${label} deleted successfully.`,
            });
          case 'disk_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Unable to delete disk ${secondaryLabel} ${
                label ? ` on ${label}` : ''
              }. Is it attached to a configuration profile that is in use?`,
              successMessage: `Disk ${secondaryLabel} deleted successfully.`,
            });
          case 'linode_snapshot':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Snapshot backup failed on Linode ${label}.`,
              link: formatLink(
                'Learn more about limits and considerations.',
                'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
              ),
              persistFailureMessage: true,
            });
          case 'backups_restore':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Backup restoration failed for ${label}.`,
              link: formatLink(
                'Learn more about limits and considerations.',
                'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
              ),
              persistFailureMessage: true,
            });
          /**
           * These create/delete failures are hypothetical.
           * We don't know if it's possible for these to fail,
           * but are including handling to be safe.
           */
          case 'linode_config_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error deleting config ${secondaryLabel}.`,
            });
          case 'linode_config_create':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error creating config ${secondaryLabel}.`,
            });
          case 'linode_clone':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error cloning Linode ${label}.`,
              successMessage: `Linode ${label} has been cloned successfully to ${secondaryLabel}.`,
            });
          case 'linode_migrate_datacenter':
          case 'linode_migrate':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error migrating Linode ${label}.`,
              successMessage: `Linode ${label} has been migrated successfully.`,
            });
          case 'linode_resize':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error resizing Linode ${label}.`,
              successMessage: `Linode ${label} has been resized successfully.`,
            });
          case 'firewall_enable':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error enabling Firewall ${label}.`,
            });
          case 'firewall_disable':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error disabling Firewall ${label}.`,
            });
          case 'firewall_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error deleting Firewall ${label}.`,
            });
          case 'firewall_device_add':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error adding ${secondaryLabel} to Firewall ${label}.`,
            });
          case 'firewall_device_remove':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error removing ${secondaryLabel} from Firewall ${label}.`,
            });
          case 'longviewclient_create':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `Error creating Longview Client ${label}.`,
              successMessage: `Longview Client ${label} successfully created.`,
            });
          default:
            // eslint-disable-next-line array-callback-return
            return;
        }
      })
      /**
       * In the somewhat unlikely scenario that we get a flood of events, we're
       * going to buffer for 1s to prevent data loss from React setState being unable
       * to keep up with the process.
       */
      .filter(Boolean)
      .bufferTime(500)
      .subscribe((toasts) => {
        if (toasts.length === 0) {
          return;
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [props]);

  return null;
};

export default withSnackbar(ToastNotifications);

const formatLink = (text: string, link: string, handleClick?: any) => {
  return (
    <Link onClick={handleClick} to={link}>
      {text}
    </Link>
  );
};
