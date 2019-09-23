import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ManagedServicePayload } from 'src/services/managed';
import { ApplicationState } from 'src/store';
import { UpdateServicePayload } from 'src/store/managed/managed.actions';
import {
  createServiceMonitor as _createServiceMonitor,
  deleteServiceMonitor as _deleteServiceMonitor,
  disableServiceMonitor as _disableServiceMonitor,
  enableServiceMonitor as _enableServiceMonitor,
  requestManagedServices as _requestManagedServices,
  updateServiceMonitor as _updateServiceMonitor
} from 'src/store/managed/managed.requests';
import { EntityError } from 'src/store/types';

export interface ManagedProps {
  monitors: Linode.ManagedServiceMonitor[];
  managedLoading: boolean;
  managedError: EntityError;
  lastUpdated: number;
}

export interface DispatchProps {
  requestManagedServices: () => Promise<any>;
  disableServiceMonitor: (monitorID: number) => Promise<any>;
  createServiceMonitor: (params: ManagedServicePayload) => Promise<any>;
  enableServiceMonitor: (monitorID: number) => Promise<any>;
  deleteServiceMonitor: (monitorID: number) => Promise<any>;
  updateServiceMonitor: (params: UpdateServicePayload) => Promise<any>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  createServiceMonitor: (params: ManagedServicePayload) =>
    dispatch(_createServiceMonitor(params)),
  requestManagedServices: () => dispatch(_requestManagedServices()),
  disableServiceMonitor: (monitorID: number) =>
    dispatch(_disableServiceMonitor({ monitorID })),
  deleteServiceMonitor: (monitorID: number) =>
    dispatch(_deleteServiceMonitor({ monitorID })),
  enableServiceMonitor: (monitorID: number) =>
    dispatch(_enableServiceMonitor({ monitorID })),
  updateServiceMonitor: (params: UpdateServicePayload) =>
    dispatch(_updateServiceMonitor(params))
});

export default <TInner extends {}, TOuter extends {}>(
  mapManagedServicesToProps?: (
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

      if (mapManagedServicesToProps) {
        return mapManagedServicesToProps(
          ownProps,
          managedLoading,
          lastUpdated,
          monitors,
          managedError
        );
      }

      return {
        ...ownProps,
        monitors,
        managedLoading,
        managedError,
        lastUpdated
      };
    },
    mapDispatchToProps
  );
