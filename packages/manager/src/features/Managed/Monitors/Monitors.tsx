import * as React from 'react';
import { compose } from 'recompose';

import withManagedServices, {
  DispatchProps,
  ManagedProps
} from 'src/containers/managedServices.container';
import useReduxLoad from 'src/hooks/useReduxLoad';
import MonitorTable from './MonitorTable';

type CombinedProps = ManagedProps & DispatchProps;

export const Monitors: React.FC<CombinedProps> = props => {
  const { managedError, monitors } = props;

  const { _loading } = useReduxLoad(['managed']);

  return (
    <MonitorTable
      monitors={monitors || []}
      loading={_loading}
      error={managedError.read}
    />
  );
};

const enhanced = compose<CombinedProps, {}>(
  withManagedServices(
    (ownProps, managedLoading, lastUpdated, monitors, managedError) => ({
      ...ownProps,
      managedLoading,
      lastUpdated,
      monitors,
      managedError
    })
  )
);
export default enhanced(Monitors);
