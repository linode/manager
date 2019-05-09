import * as React from 'react';

import ClusterList from '../ClusterList/ClusterList';
import KubernetesLandingEmptyState from './KubernetesLandingEmptyState';

export const KubernetesLanding: React.FunctionComponent = () => {
  const [clusters] = React.useState<Linode.KubernetesCluster[]>([]);

  if (clusters.length === 0) {
    return <KubernetesLandingEmptyState />;
  }

  return <ClusterList />;
};

export default KubernetesLanding;
