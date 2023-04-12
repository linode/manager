import { vi } from 'vitest';
import * as React from 'react';
import { shallow } from 'enzyme';
import { AuthenticationWrapper } from 'src/components/AuthenticationWrapper/AuthenticationWrapper';

const component = shallow<AuthenticationWrapper>(
  <AuthenticationWrapper
    isAuthenticated={false}
    linodesLastUpdated={0}
    linodesLoading={false}
    initSession={vi.fn()}
    requestLinodes={vi.fn()}
    markAppAsDoneLoading={vi.fn()}
    checkAccountSize={vi.fn()}
    pendingUpload={false}
    linodes={[]}
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

  it('should set showChildren state to true when the isAuthenticated prop goes from false to true', () => {
    component.setState({ showChildren: false });
    component.setProps({ isAuthenticated: true });
    expect(component.state('showChildren')).toBeTruthy();
  });
});
