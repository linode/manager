import { Event, EventStatus } from '@linode/api-v4/lib/account/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import { Subscription } from 'rxjs/Subscription';
import Link from 'src/components/Link';
import { events$ } from 'src/events';
import { sendEvent } from 'src/utilities/ga';

interface ToastOptions {
  enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'];
  eventStatus: EventStatus;
  persistSuccessMessage?: boolean;
  persistFailureMessage?: boolean;
  successMessage?: string;
  failureMessage?: string;
  includesLink?: boolean;
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
    includesLink,
    link,
  } = options;
  let linkedMessage;

  if (
    ['finished', 'notification'].includes(eventStatus) &&
    Boolean(successMessage)
  ) {
    return enqueueSnackbar(successMessage, {
      variant: 'success',
      persist: persistSuccessMessage,
    });
  } else if (['failed'].includes(eventStatus) && Boolean(failureMessage)) {
    if (includesLink) {
      linkedMessage = (
        <>
          {failureMessage}&nbsp;
          {link}
        </>
      );
    }
    return enqueueSnackbar(linkedMessage ?? failureMessage, {
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

class ToastNotifications extends React.PureComponent<WithSnackbarProps, {}> {
  subscription: Subscription;

  componentDidMount() {
    this.subscription = events$
      .filter((e) => !e._initial)
      .map((event) => {
        const { enqueueSnackbar } = this.props;
        const label = getLabel(event);
        const secondaryLabel = getSecondaryLabel(event);
        switch (event.action) {
          case 'volume_attach':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Volume ${label} successfully attached.`,
              failureMessage: `Error attaching Volume ${label}.`,
            });
          case 'volume_detach':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Volume ${label} successfully detached.`,
              failureMessage: `Error detaching Volume ${label}.`,
            });
          case 'volume_create':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Volume ${label} successfully created.`,
              failureMessage: `Error creating Volume ${label}.`,
            });
          case 'volume_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Volume successfully deleted.`,
              failureMessage: `Error deleting Volume.`,
            });
          case 'disk_imagize':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Image ${secondaryLabel} created successfully.`,
              failureMessage: `Error creating Image ${secondaryLabel}.`,
            });
          case 'disk_resize':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              persistFailureMessage: true,
              successMessage: `Disk ${secondaryLabel} resized successfully.`,
              failureMessage: `Disk resize failed.`,
              includesLink: true,
              link: formatLink(
                'Learn more about resizing restrictions.',
                'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/',
                sendEvent({
                  category: 'Disk Resize Flow',
                  action: `Click:link`,
                  label: 'Disk resize failed toast',
                })
              ),
            });
          case 'image_upload':
            const isDeletion = event.message === 'Upload cancelled.';
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              persistFailureMessage: true,
              successMessage: `Image ${label} is now available.`,
              failureMessage: isDeletion
                ? undefined
                : `There was a problem processing image ${label}: ${event.message?.replace(
                    'cancelled',
                    'canceled'
                  )}`,
            });
          case 'image_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Image ${label} deleted successfully.`,
              failureMessage: `Error deleting Image ${label}.`,
            });
          case 'disk_delete':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Disk ${secondaryLabel} deleted successfully.`,
              failureMessage: `Unable to delete disk ${secondaryLabel} ${
                label ? ` on ${label}` : ''
              }. Is it attached to a configuration profile that is in use?`,
            });
          case 'linode_snapshot':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              failureMessage: `There was an error creating a snapshot on Linode ${label}.`,
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
              successMessage: `Linode ${label} has been cloned successfully to ${secondaryLabel}.`,
              failureMessage: `Error cloning Linode ${label}.`,
            });
          case 'linode_migrate_datacenter':
          case 'linode_migrate':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Linode ${label} has been migrated successfully.`,
              failureMessage: `Error migrating Linode ${label}.`,
            });
          case 'linode_resize':
            return toastSuccessAndFailure({
              enqueueSnackbar,
              eventStatus: event.status,
              successMessage: `Linode ${label} has been resized successfully.`,
              failureMessage: `Error resizing Linode ${label}.`,
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
              successMessage: `Longview Client ${label} successfully created.`,
              failureMessage: `Error creating Longview Client ${label}.`,
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
  }
  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return null;
  }
}

export default withSnackbar(ToastNotifications);

const formatLink = (text: string, link: string, handleClick: any) => {
  return (
    <Link to={link} onClick={() => handleClick}>
      {text}
    </Link>
  );
};
