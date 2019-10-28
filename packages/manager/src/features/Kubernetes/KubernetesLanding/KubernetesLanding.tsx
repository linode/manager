import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import withKubernetes, {
  DispatchProps,
  KubernetesProps
} from 'src/containers/kubernetes.container';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import ClusterList from '../ClusterList';
import KubernetesLandingEmptyState from './KubernetesLandingEmptyState';

type CombinedProps = DispatchProps & KubernetesProps;

export const KubernetesLanding: React.FunctionComponent<
  CombinedProps
> = props => {
  const {
    clusters,
    clustersError,
    clustersLoading,
    nodePoolsLoading,
    lastUpdated,
    deleteCluster,
    requestKubernetesClusters,
    setKubernetesErrors,
    ...reactRouterProps
  } = props;
  React.useEffect(() => {
    requestKubernetesClusters();
  }, []);

  const clearErrors = () => {
    setKubernetesErrors({});
  };

  if (clustersError.read) {
    return (
      <ErrorState
        errorText={getErrorStringOrDefault(
          clustersError.read,
          'There was an error loading your Kubernetes clusters.'
        )}
      />
    );
  }

  if ((clustersLoading && lastUpdated === 0) || nodePoolsLoading) {
    return <CircleProgress />;
  }

  if (clusters && clusters.length === 0) {
    return <KubernetesLandingEmptyState />;
  }

  return (
    <ClusterList
      clusters={clusters || []}
      deleteCluster={deleteCluster}
      error={clustersError}
      clearErrors={clearErrors}
      {...reactRouterProps}
    />
  );
};

const enhanced = compose<CombinedProps, {}>(withKubernetes());

export default enhanced(KubernetesLanding);
