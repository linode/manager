import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { requestManagedServices as _requestManagedServices } from 'src/store/managed/managed.requests';
import { EntityError } from 'src/store/types';

export interface ManagedProps {
  monitors: Linode.ManagedServiceMonitor[];
  managedLoading: boolean;
  managedError: EntityError;
  lastUpdated: number;
}

export interface DispatchProps {
  requestManagedServices: () => Promise<any>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestManagedServices: () => dispatch(_requestManagedServices())
});

export default <TInner extends {}, TOuter extends {}>(
  mapManagedServicesToProps: (
    ownProps: TOuter,
    managedLoading: boolean,
    lastUpdated: number,
    monitors: Linode.ManagedServiceMonitor[],
    managedError?: EntityError
  ) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const monitors = state.__resources.managed.entities;
      const managedLoading = state.__resources.managed.loading;
      const managedError = state.__resources.managed.error;
      const lastUpdated = state.__resources.managed.lastUpdated;

      return mapManagedServicesToProps(
        ownProps,
        managedLoading,
        lastUpdated,
        monitors,
        managedError
      );
    },
    mapDispatchToProps
  );
