import { mount } from 'enzyme';
import * as React from 'react';

import Notice from 'src/components/Notice';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import { EmailChangeForm } from './EmailChangeForm';

import { Provider } from 'react-redux';
import store from 'src/store';

describe('Email change form', () => {
  const updateProfile = jest.fn();

  const component = mount(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark" spacing="normal">
        <EmailChangeForm
          classes={{
            root: '',
            title: ''
          }}
          username="ThisUser"
          email="thisuser@example.com"
          updateProfile={updateProfile}
        />
      </LinodeThemeWrapper>
    </Provider>
  );

  it('should render textfields for username and email.', () => {
    expect(component.find('ForwardRef(TextField)')).toHaveLength(2);
  });

  it('the username field should be disabled.', () => {
    expect(
      component.find('ForwardRef(TextField)[data-qa-username]').props().disabled
    ).toBeTruthy();
  });

  // This is an active-ish issue on Github (https://github.com/airbnb/enzyme/issues/1188)
  // These tests should work, but currently enzyme doesn't handle conditional rendering.

  xit('should display a notice on success.', () => {
    const success = 'Account information updated.';
    component.setState({ success });
    component.update();
    expect(
      component.containsMatchingElement(<Notice success text={success} />)
    ).toBeTruthy();
  });

  xit('should display a notice for a general error', () => {
    const errors = [{ reason: 'Something bad' }];
    component.setState({ errors });
    component.update();
    expect(
      component.containsMatchingElement(<Notice error text={'Something bad'} />)
    ).toBeTruthy();
  });
});
