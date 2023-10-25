import { shallow } from 'enzyme';
import * as React from 'react';

import { AuthenticationWrapper } from 'src/components/AuthenticationWrapper/AuthenticationWrapper';
import { queryClientFactory } from 'src/queries/base';
import { storeFactory } from 'src/store';

const queryClient = queryClientFactory();
const store = storeFactory(queryClient);

const component = shallow<AuthenticationWrapper>(
  <AuthenticationWrapper
    initSession={jest.fn()}
    isAuthenticated={false}
    markAppAsDoneLoading={jest.fn()}
    pendingUpload={false}
    queryClient={queryClient}
    store={store}
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
    expect(component.childAt(0)).toBeDefined();
  });
  it('should invoke props.initSession when the component is mounted', () => {
    expect(component.instance().props.initSession).toHaveBeenCalledTimes(1);
  });
  it('should not showChildren initially because they should be shown after makeInitialRequests', () => {
    component.setState({ showChildren: false });
    component.setProps({ isAuthenticated: true });
    expect(component.state('showChildren')).toBeFalsy();
  });
});
