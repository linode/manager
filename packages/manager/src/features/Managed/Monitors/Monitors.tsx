import { ManagedCredential } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import withManagedIssues, {
  DispatchProps as IssuesDispatchProps
} from 'src/containers/managedIssues.container';
import withManagedServices, {
  DispatchProps,
  ManagedProps
} from 'src/containers/managedServices.container';
import useFlags from 'src/hooks/useFlags';
import useReduxLoad from 'src/hooks/useReduxLoad';
import MonitorTable from './MonitorTable';
import MonitorTable_CMR from './MonitorTable_CMR';

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

  const flags = useFlags();
  const { _loading } = useReduxLoad(['managed', 'managedIssues']);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {flags.cmr ? (
        <MonitorTable_CMR
          monitors={monitors || []}
          credentials={credentials}
          groups={groups}
          loading={loading || _loading}
          error={managedError.read || errorFromProps}
          {...rest}
        />
      ) : (
        <MonitorTable
          monitors={monitors || []}
          credentials={credentials}
          groups={groups}
          loading={loading || _loading}
          error={managedError.read || errorFromProps}
          {...rest}
        />
      )}
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withManagedIssues(),
  withManagedServices()
);
export default enhanced(Monitors);
