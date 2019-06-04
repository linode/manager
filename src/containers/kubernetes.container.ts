import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';
import { requestKubernetesClusters as _requestKubernetesClusters } from 'src/store/kubernetes/kubernetes.requests';
import { EntityError } from 'src/store/types';

export interface KubernetesProps {
  clusters?: Linode.KubernetesCluster[];
  clustersLoading: boolean;
  clustersError: EntityError;
  lastUpdated?: number;
}

export interface DispatchProps {
  requestKubernetesClusters: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestKubernetesClusters: () => dispatch(_requestKubernetesClusters())
});

export default <TInner extends {}, TOuter extends {}>(
  mapKubernetesToProps: (
    ownProps: TOuter,
    clustersLoading: boolean,
    lastUpdated: number,
    clustersError: EntityError,
    clusters?: Linode.KubernetesCluster[]
  ) => TInner
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const clusters = state.__resources.kubernetes.entities;
      const clustersLoading = state.__resources.kubernetes.loading;
      const clustersError = state.__resources.kubernetes.error || {};
      const lastUpdated = state.__resources.kubernetes.lastUpdated;

      return mapKubernetesToProps(
        ownProps,
        clustersLoading,
        lastUpdated,
        clustersError,
        clusters
      );
    },
    mapDispatchToProps
  );
