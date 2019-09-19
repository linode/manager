import { shallow } from 'enzyme';
import * as React from 'react';

import { AuthenticationWrapper } from 'src/components/AuthenticationWrapper/AuthenticationWrapper';

/**
 * prevent console errors in Jest tests
 * see: https://github.com/jsdom/jsdom/issues/2112
 */
window.location.assign = jest.fn();

const component = shallow<AuthenticationWrapper>(
  <AuthenticationWrapper
    isAuthenticated={false}
    initSession={jest.fn()}
    requestAccount={jest.fn()}
    requestTypes={jest.fn()}
    requestBuckets={jest.fn()}
    requestClusters={jest.fn()}
    requestFirewalls={jest.fn()}
    requestDomains={jest.fn()}
    requestImages={jest.fn()}
    requestLinodes={jest.fn()}
    requestNotifications={jest.fn()}
    requestProfile={jest.fn()}
    requestRegions={jest.fn()}
    requestSettings={jest.fn()}
    requestVolumes={jest.fn()}
    nodeBalancerActions={{
      createNodeBalancer: jest.fn(),
      deleteNodeBalancer: jest.fn(),
      getAllNodeBalancers: jest.fn(),
      getAllNodeBalancersWithConfigs: jest.fn(),
      updateNodeBalancer: jest.fn()
    }}
  >
    <div />
  </AuthenticationWrapper>
);

describe('AuthenticationWrapper', () => {
  it('should render just a react fragment if showChildren state is false', () => {
    expect(component.childAt(0)).toHaveLength(0);
  });
  it('should render one child when showChildren state is true', () => {
    component.setState({ showChildren: true });
    expect(component.childAt(0)).toHaveLength(1);
  });
  it('should invoke props.initSession when the component is mounted', () => {
    expect(component.instance().props.initSession).toHaveBeenCalledTimes(1);
  });

  it('should set showChildren state to true when the isAuhenticated prop goes from false to true', () => {
    component.setState({ showChildren: false });
    component.setProps({ isAuthenticated: true });
    expect(component.state('showChildren')).toBeTruthy();
  });
});
