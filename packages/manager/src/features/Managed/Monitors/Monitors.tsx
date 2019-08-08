import * as React from 'react';
import { compose } from 'recompose';

import withManagedServices, {
  DispatchProps,
  ManagedProps
} from 'src/containers/managedServices.container';
import MonitorTable from './MonitorTable';

type CombinedProps = ManagedProps & DispatchProps;

export const Monitors: React.FC<CombinedProps> = props => {
  const {
    lastUpdated,
    managedError,
    managedLoading,
    monitors,
    requestManagedServices
  } = props;
  React.useEffect(() => {
    requestManagedServices().catch(_ => null); // Errors handled in Redux state
  }, [requestManagedServices]);

  return (
    <MonitorTable
      monitors={monitors || []}
      loading={managedLoading && lastUpdated === 0}
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
