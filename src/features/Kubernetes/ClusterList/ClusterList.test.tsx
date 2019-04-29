import { shallow } from 'enzyme';
import * as React from 'react';

import { clusters } from 'src/__data__/kubernetes';
import { ClusterContent, ClusterList } from './ClusterList';

const props = {
  classes: {
    root: '',
    title: ''
  }
};

const contentProps = {
  loading: true,
  data: []
};

const component = shallow(<ClusterList {...props} />);
const contentComponent = shallow(<ClusterContent {...contentProps} />);

const isLoading = (container: any) =>
  container.find('[data-qa-cluster-loading]');
const hasError = (container: any) => container.find('[data-qa-cluster-error]');
const isEmpty = (container: any) => container.find('[data-qa-cluster-empty]');
const hasContent = (container: any) => container.find('[data-qa-cluster-row]');

describe('ClusterRow component', () => {
  describe('ClusterContent loading/error/empty states', () => {
    it('should have a loading state', () => {
      expect(isLoading(contentComponent)).toHaveLength(1);
      expect(hasError(contentComponent)).toHaveLength(0);
      expect(isEmpty(contentComponent)).toHaveLength(0);
      expect(hasContent(contentComponent)).toHaveLength(0);
    });

    it('should have an error state', () => {
      contentComponent.setProps({ loading: false, error: 'An error' });
      expect(isLoading(contentComponent)).toHaveLength(0);
      expect(hasError(contentComponent)).toHaveLength(1);
      expect(isEmpty(contentComponent)).toHaveLength(0);
      expect(hasContent(contentComponent)).toHaveLength(0);
    });

    it('should have an empty state', () => {
      contentComponent.setProps({ loading: false, error: undefined, data: [] });
      expect(isLoading(contentComponent)).toHaveLength(0);
      expect(hasError(contentComponent)).toHaveLength(0);
      expect(isEmpty(contentComponent)).toHaveLength(1);
      expect(hasContent(contentComponent)).toHaveLength(0);
    });

    it('should display content', () => {
      contentComponent.setProps({
        loading: false,
        error: undefined,
        data: clusters
      });
      expect(isLoading(contentComponent)).toHaveLength(0);
      expect(hasError(contentComponent)).toHaveLength(0);
      expect(isEmpty(contentComponent)).toHaveLength(0);
      expect(hasContent(contentComponent)).toHaveLength(clusters.length);
    });
  });

  it.skip('should render', () => {
    expect(component).toHaveLength(1);
  });
});
