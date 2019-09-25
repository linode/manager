import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import { Subscription } from 'rxjs/Subscription';
import { events$ } from 'src/events';

class ToastNotifications extends React.PureComponent<WithSnackbarProps, {}> {
  subscription: Subscription;

  componentDidMount() {
    this.subscription = events$
      .filter(e => !e._initial)
      .map(event => {
        const { enqueueSnackbar } = this.props;

        if (
          event.action === 'volume_detach' &&
          ['finished', 'notification'].includes(event.status)
        ) {
          return enqueueSnackbar(`Volume successfully detached.`, {
            variant: 'success'
          });
        }

        if (
          event.action === 'volume_attach' &&
          ['finished', 'notification'].includes(event.status)
        ) {
          return enqueueSnackbar(`Volume successfully attached.`, {
            variant: 'success'
          });
        }

        if (
          event.action === 'volume_create' &&
          ['finished', 'notification'].includes(event.status)
        ) {
          return enqueueSnackbar(`Volume successfully created.`, {
            variant: 'success'
          });
        }

        if (
          event.action === 'volume_delete' &&
          ['finished', 'notification'].includes(event.status)
        ) {
          return enqueueSnackbar(`Volume successfully deleted.`, {
            variant: 'success'
          });
        }

        if (event.action === 'disk_imagize' && event.status === 'failed') {
          return enqueueSnackbar('There was an error creating an image.', {
            variant: 'error'
          });
        }

        if (event.action === 'image_delete' && event.status === 'failed') {
          return enqueueSnackbar('There was an error deleting an image.', {
            variant: 'error'
          });
        }

        if (
          event.action === 'disk_imagize' &&
          ['finished', 'notification'].includes(event.status)
        ) {
          return enqueueSnackbar('Image created successfully.', {
            variant: 'success'
          });
        }

        if (
          event.action === 'image_delete' &&
          ['finished', 'notification'].includes(event.status)
        ) {
          return enqueueSnackbar('Image deleted successfully.', {
            variant: 'success'
          });
        }

        if (event.action === 'volume_create' && event.status === 'failed') {
          return enqueueSnackbar(
            `There was an error attaching volume ${event.entity &&
              event.entity.label}.`,
            { variant: 'error' }
          );
        }

        if (event.action === 'disk_delete' && event.status === 'failed') {
          const label = pathOr(false, ['entity', 'label'], event);
          return enqueueSnackbar(
            `Unable to delete disk${
              label ? ` on ${label}` : ''
            }. Is it attached to a configuration profile that is in use?`,
            { variant: 'error' }
          );
        }

        return;
      })
      /**
       * In the somewhat unlikely scenario that we get a flood of events, we're
       * going to buffer for 1s to prevent data loss from React setState being unable
       * to keep up with the process.
       */
      .filter(Boolean)
      .bufferTime(500)
      .subscribe(toasts => {
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
