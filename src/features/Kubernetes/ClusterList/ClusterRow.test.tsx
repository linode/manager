import { shallow } from 'enzyme';
import * as React from 'react';

import { clusters } from 'src/__data__/kubernetes';
import { ClusterRow } from './ClusterRow';

const props = {
  cluster: clusters[0],
  classes: {
    root: '',
    label: '',
    clusterDescription: ''
  },
  typesData: []
};

const component = shallow(<ClusterRow {...props} />);

describe('ClusterRow component', () => {
  it('should render without crashing', () => {
    expect(component).toHaveLength(1);
  });

  it('should render the cluster version', () => {
    const version = component.find('[data-qa-cluster-version]');
    expect(version.contains(clusters[0].version)).toBeTruthy();
  });

  it('should render the cluster label', () => {
    const label = component.find('[data-qa-cluster-label]');
    expect(label.contains(clusters[0].label)).toBeTruthy();
  });

  it('should render the region', () => {
    const region = component.find('[data-qa-cluster-region]');
    expect(region.contains(clusters[0].region)).toBeTruthy();
  });
});
