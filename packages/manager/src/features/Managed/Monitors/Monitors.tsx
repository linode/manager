import { ManagedCredential } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import withManagedIssues, {
  DispatchProps as IssuesDispatchProps,
} from 'src/containers/managedIssues.container';
import withManagedServices, {
  DispatchProps,
  ManagedProps,
} from 'src/containers/managedServices.container';
import useReduxLoad from 'src/hooks/useReduxLoad';
import MonitorTable from './MonitorTable';

interface Props {
  credentials: ManagedCredential[];
  groups: string[];
  loading: boolean;
  errorFromProps?: APIError[];
}

type CombinedProps = Props & ManagedProps & DispatchProps & IssuesDispatchProps;

export const Monitors: React.FC<CombinedProps> = props => {
  const {
    credentials,
    groups,
    loading,
    errorFromProps,
    managedError,
    monitors,
    ...rest
  } = props;

  const { _loading } = useReduxLoad(['managed', 'managedIssues']);

  return (
    <MonitorTable
      monitors={monitors || []}
      credentials={credentials}
      groups={groups}
      loading={loading || _loading}
      error={managedError.read || errorFromProps}
      {...rest}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(
  withManagedIssues(),
  withManagedServices()
);
export default enhanced(Monitors);
