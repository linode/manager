import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import KubernetesContainer, {
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
    requestKubernetesClusters
  } = props;
  React.useEffect(() => {
    requestKubernetesClusters();
  }, []);

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

  if (clustersLoading) {
    return <CircleProgress />;
  }

  if (clusters && clusters.length === 0) {
    return <KubernetesLandingEmptyState />;
  }

  return <ClusterList clusters={clusters || []} />;
};

const withKubernetes = KubernetesContainer(
  (ownProps, clustersLoading, lastUpdated, clustersError, clusters) => ({
    ...ownProps,
    clusters,
    clustersError,
    clustersLoading
  })
);

const enhanced = compose(withKubernetes);

export default enhanced(KubernetesLanding);
