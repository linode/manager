import { mount } from 'enzyme';
import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import EmailChangeForm from './EmailChangeForm';

describe('Email change form', () => {
  const onCancel = jest.fn();
  const onSubmit = jest.fn();
  const onChange = jest.fn();
  
  const component = mount(
    <LinodeThemeWrapper>
      <EmailChangeForm
        email='example@example.com'
        error={undefined}
        username='ThisUser'
        submitting={false}
        handleChange={onChange}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </LinodeThemeWrapper>,
  );

  const submitButton = component.find('Button[data-qa-submit]');

  it('should render textfields for username and email.', () => {
    expect(component.find('TextField')).toHaveLength(2);
  });

  it('the username field should be disabled.', () => {
    expect(component.find('TextField[data-qa-username]').props().disabled).toBeTruthy();
  });

  describe('submit button', () => {
    it('should exist', () => {
      expect(submitButton.length).toBe(1)
    });

    it('should call onSubmit when clicked', () => {
      submitButton.simulate('click');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
