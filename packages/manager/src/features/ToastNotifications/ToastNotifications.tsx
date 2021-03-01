import { Event, EventStatus } from '@linode/api-v4/lib/account/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { curry } from 'ramda';
import * as React from 'react';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import { Subscription } from 'rxjs/Subscription';
import { events$ } from 'src/events';

/**
 * Boilerplate for sending a success toast
 * when an event succeeds and a failure toast
 * when it fails. Intended to be partially applied
 * with the snackbar method and event status.
 *
 * Note: due to the nature of currying, if you want to
 * omit the success or failure message, you must manually pass `undefined`
 * as the final argument, otherwise you get a function that's expecting
 * a failureMessage instead of the toasts you want.
 */
export const toastSuccessAndFailure = curry(
  (
    enqueueSnackbar: WithSnackbarProps['enqueueSnackbar'],
    eventStatus: EventStatus,
    successMessage: string | undefined,
    failureMessage: string | undefined
  ) => {
    if (
      ['finished', 'notification'].includes(eventStatus) &&
      Boolean(successMessage)
    ) {
      return enqueueSnackbar(successMessage, { variant: 'success' });
    } else if (['failed'].includes(eventStatus) && Boolean(failureMessage)) {
      return enqueueSnackbar(failureMessage, { variant: 'error' });
    } else {
      return;
    }
  }
);

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
        const _toast = toastSuccessAndFailure(enqueueSnackbar, event.status);
        const label = getLabel(event);
        const secondaryLabel = getSecondaryLabel(event);
        switch (event.action) {
          case 'volume_attach':
            return _toast(
              `Volume ${label} successfully attached.`,
              `Error attaching Volume ${label}.`
            );
          case 'volume_detach':
            return _toast(
              `Volume ${label} successfully detached.`,
              `Error detaching Volume ${label}.`
            );
          case 'volume_create':
            return _toast(
              `Volume ${label} successfully created.`,
              `Error creating Volume ${label}.`
            );
          case 'volume_delete':
            return _toast(
              `Volume successfully deleted.`,
              `Error deleting Volume.`
            );
          case 'disk_imagize':
            return _toast(
              `Image ${secondaryLabel} created successfully.`,
              `Error creating Image ${secondaryLabel}.`
            );
          case 'image_delete':
            return _toast(
              `Image ${label} deleted successfully.`,
              `Error deleting Image ${label}.`
            );
          case 'disk_delete':
            return _toast(
              `Disk ${secondaryLabel} deleted successfully.`,
              `Unable to delete disk ${secondaryLabel} ${
                label ? ` on ${label}` : ''
              }. Is it attached to a configuration profile that is in use?`
            );
          case 'linode_snapshot':
            return _toast(
              undefined,
              `There was an error creating a snapshot on Linode ${label}.`
            );
          /**
           * These create/delete failures are hypothetical.
           * We don't know if it's possible for these to fail,
           * but are including handling to be safe.
           */
          case 'linode_config_delete':
            return _toast(
              undefined,
              `Error deleting config ${secondaryLabel}.`
            );
          case 'linode_config_create':
            return _toast(
              undefined,
              `Error creating config ${secondaryLabel}.`
            );
          case 'linode_clone':
            return _toast(
              `Linode ${label} has been cloned successfully to ${secondaryLabel}.`,
              `Error cloning Linode ${label}.`
            );
          case 'linode_migrate_datacenter':
          case 'linode_migrate':
            return _toast(
              `Linode ${label} has been migrated successfully.`,
              `Error migrating Linode ${label}.`
            );
          case 'linode_resize':
            return _toast(
              `Linode ${label} has been resized successfully.`,
              `Error resizing Linode ${label}.`
            );
          case 'firewall_enable':
            return _toast(undefined, `Error enabling Firewall ${label}.`);
          case 'firewall_disable':
            return _toast(undefined, `Error disabling Firewall ${label}.`);
          case 'firewall_delete':
            return _toast(undefined, `Error deleting Firewall ${label}.`);
          case 'firewall_device_add':
            return _toast(
              undefined,
              `Error adding ${secondaryLabel} to Firewall ${label}.`
            );
          case 'firewall_device_remove':
            return _toast(
              undefined,
              `Error removing ${secondaryLabel} from Firewall ${label}.`
            );
          case 'longviewclient_create':
            return _toast(
              `Longview Client ${label} successfully created.`,
              `Error creating Longview Client ${label}.`
            );
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
