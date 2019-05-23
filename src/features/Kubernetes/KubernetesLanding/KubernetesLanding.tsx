import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { getKubernetesClusters } from 'src/services/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import ClusterList from '../ClusterList';
import KubernetesLandingEmptyState from './KubernetesLandingEmptyState';

export const KubernetesLanding: React.FunctionComponent = () => {
  const [clusters, setClusters] = React.useState<Linode.KubernetesCluster[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setLoading(true);
    getKubernetesClusters()
      .then(response => {
        setClusters(response.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(
          getAPIErrorOrDefault(
            err,
            'There was an error loading your Kubernetes Clusters.'
          )[0].reason
        );
      });
  }, []);

  if (error) {
    return <ErrorState errorText={error} />;
  }

  if (loading) {
    return <CircleProgress />;
  }

  if (clusters.length === 0) {
    return <KubernetesLandingEmptyState />;
  }

  return <ClusterList clusters={clusters} />;
};

export default KubernetesLanding;
