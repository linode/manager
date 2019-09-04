import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import withManagedServices, {
  DispatchProps,
  ManagedProps
} from 'src/containers/managedServices.container';
import MonitorTable from './MonitorTable';

interface Props {
  credentials: Linode.ManagedCredential[];
  groups: string[];
  loading: boolean;
  errorFromProps?: APIError[];
}

type CombinedProps = Props & ManagedProps & DispatchProps;

export const Monitors: React.FC<CombinedProps> = props => {
  const {
    credentials,
    groups,
    lastUpdated,
    loading,
    errorFromProps,
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
      credentials={credentials}
      groups={groups}
      loading={loading || (managedLoading && lastUpdated === 0)}
      error={managedError.read || errorFromProps}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(
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
