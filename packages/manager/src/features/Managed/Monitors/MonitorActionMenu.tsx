import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import withManagedServices, {
  DispatchProps
} from 'src/containers/managedServices.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  monitorID: number;
  status: Linode.MonitorStatus;
}

export type CombinedProps = Props & DispatchProps & WithSnackbarProps;

export class MonitorActionMenu extends React.Component<CombinedProps, {}> {
  createActions = () => {
    const {
      deleteServiceMonitor,
      disableServiceMonitor,
      enableServiceMonitor,
      enqueueSnackbar,
      monitorID,
      status
    } = this.props;

    const handleError = (message: string, error: Linode.ApiFieldError[]) => {
      const errMessage = getAPIErrorOrDefault(error, message);
      enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
    };

    return (closeMenu: Function): Action[] => {
      const actions = [
        status === 'disabled'
          ? {
              title: 'Enable',
              onClick: () => {
                enableServiceMonitor(monitorID)
                  .then(_ => {
                    enqueueSnackbar('Monitor enabled successfully.', {
                      variant: 'success'
                    });
                  })
                  .catch(e => {
                    handleError('Error enabling this service Monitor.', e);
                  });
                closeMenu();
              }
            }
          : {
              title: 'Disable',
              onClick: () => {
                disableServiceMonitor(monitorID)
                  .then(_ => {
                    enqueueSnackbar('Monitor disabled successfully.', {
                      variant: 'success'
                    });
                  })
                  .catch(e => {
                    handleError('Error disabling this Service Monitor.', e);
                  });
                closeMenu();
              }
            },
        {
          title: 'Delete',
          onClick: () => {
            deleteServiceMonitor(monitorID)
              .then(_ => {
                enqueueSnackbar('Monitor deleted successfully.', {
                  variant: 'success'
                });
              })
              .catch(e => {
                handleError('Error deleting this Service Monitor.', e);
              });
            closeMenu();
          }
        }
      ];
      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

const enhanced = compose<CombinedProps, Props>(
  // This is just a quick way to get access to managed Redux actions
  withManagedServices(() => ({})),
  withSnackbar
);

export default enhanced(MonitorActionMenu);
