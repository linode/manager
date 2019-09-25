import { shallow } from 'enzyme';
import * as React from 'react';
import { ClusterSelect } from './ClusterSelect';

describe('ClusterSelect', () => {
  const onChangeMock = jest.fn();
  const onBlurMock = jest.fn();

  const wrapper = shallow(
    <ClusterSelect
      selectedCluster="a-cluster"
      onChange={onChangeMock}
      onBlur={onBlurMock}
      clustersData={[]}
      clustersLoading={false}
    />
  );

  it('should render without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('should pass down error messages to <Select />', () => {
    wrapper.setProps({ clustersError: 'error' });
    expect(wrapper.find('WithStyles(Select)').prop('errorText')).toBe(
      'Error loading Regions'
    );

    wrapper.setProps({ error: 'Field Error', clustersError: undefined });
    expect(wrapper.find('WithStyles(Select)').prop('errorText')).toBe(
      'Field Error'
    );
  });
});
