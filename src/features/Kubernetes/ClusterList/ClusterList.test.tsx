import { shallow } from 'enzyme';
import * as React from 'react';

import { clusters } from 'src/__data__/kubernetes';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { ClusterContent, ClusterList } from './ClusterList';

const props = {
  classes: {
    root: '',
    title: '',
    labelHeader: '',
    clusters
  },
  ...reactRouterProps
};

const component = shallow(<ClusterList {...props} />);
const contentComponent = shallow(<ClusterContent data={clusters} />);

const hasContent = (container: any) => container.find('[data-qa-cluster-row]');

describe('ClusterList component', () => {
  describe('ClusterContent', () => {
    it('should display content', () => {
      expect(hasContent(contentComponent)).toHaveLength(clusters.length);
    });
  });

  it('should render', () => {
    expect(component).toHaveLength(1);
  });
});
