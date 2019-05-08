import * as React from 'react';

import ClusterList from '../ClusterList/ClusterList';
import KubernetesLandingEmptyState from './KubernetesLandingEmptyState';

export class KubernetesLanding extends React.Component {
  render() {
    // @todo update to something real.
    const clusterCount = 0;
    if (clusterCount === 0 || null) {
      return <KubernetesLandingEmptyState />;
    }

    return <ClusterList />;
  }
}

export default KubernetesLanding;
