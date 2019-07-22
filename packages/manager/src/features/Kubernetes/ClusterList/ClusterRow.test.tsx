import { shallow } from 'enzyme';
import * as React from 'react';

import { extendedClusters } from 'src/__data__/kubernetes';
import { ClusterRow } from './ClusterRow';

const cluster = {
  ...extendedClusters[0],
  node_pools: extendedClusters[0].node_pools.map(pool => ({
    ...pool,
    totalMonthlyPrice: 10
  }))
};

const props = {
  cluster,
  classes: {
    root: '',
    label: '',
    clusterDescription: '',
    clusterRow: ''
  }
};

const component = shallow(<ClusterRow {...props} />);

describe('ClusterRow component', () => {
  it('should render without crashing', () => {
    expect(component).toHaveLength(1);
  });

  it('should render the cluster version', () => {
    const version = component.find('[data-qa-cluster-version]');
    expect(version.contains(extendedClusters[0].version)).toBeTruthy();
  });

  it('should render the cluster label', () => {
    const label = component.find('[data-qa-cluster-label]');
    expect(label.contains(extendedClusters[0].label)).toBeTruthy();
  });

  it('should render the region', () => {
    const region = component.find('[data-qa-cluster-region]');
    expect(region.contains(extendedClusters[0].region)).toBeTruthy();
  });
});
