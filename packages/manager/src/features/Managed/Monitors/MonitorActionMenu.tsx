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
      disableServiceMonitor,
      enqueueSnackbar,
      monitorID,
      status
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        status === 'disabled'
          ? {
              title: 'Enable',
              onClick: () => closeMenu()
            }
          : {
              title: 'Disable',
              onClick: () => {
                disableServiceMonitor(monitorID).catch(e => {
                  const errMessage = getAPIErrorOrDefault(
                    e,
                    'Error disabling this Service Monitor.'
                  );
                  enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
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
