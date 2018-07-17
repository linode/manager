import { mount } from 'enzyme';
import * as React from 'react';

import Notice from 'src/components/Notice';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import { EmailChangeForm } from './EmailChangeForm';

describe('Email change form', () => {
  const updateProfile = jest.fn();

  const component = mount(
    <LinodeThemeWrapper>
      <EmailChangeForm
        classes={{
          root: '',
          title: '',
        }}
        email='example@example.com'
        loading={false}
        username='ThisUser'
        updateProfile={updateProfile}
      />
    </LinodeThemeWrapper>,
  );

  xit('should render textfields for username and email.', () => {
    expect(component.find('TextField')).toHaveLength(2);
  });

  xit('the username field should be disabled.', () => {
    expect(component.find('TextField[data-qa-username]').props().disabled).toBeTruthy();
  });

  xit('should display a notice on success.', () => {
    const success = 'Account information updated.';
    component.setState({ success });
    expect(component.containsMatchingElement(<Notice success text={success} />)).toBeTruthy();
  });

  xit('should display a notice for a general error', () => {
    const errors = [{'reason': 'Something bad'}];
    component.setState({ errors });
    expect(component.containsMatchingElement(<Notice error text={'Something bad'} />)).toBeTruthy();
  });

  xit('should not render the email form when loading', () => {
    expect(component.find('[data-qa-email-change]')).toHaveLength(1);
    component.setProps({ loading: true });
    expect(component.find('[data-qa-email-change]')).toHaveLength(0);
  });
});
