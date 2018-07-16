import { shallow } from 'enzyme';
import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';

import Notice from 'src/components/Notice';


describe('Email change form', () => {
  const update = jest.fn();

  const component = shallow(
    <DisplaySettings 
      loading={false} 
      username="exampleuser" 
      email="me@this.com" 
      updateProfile={update}
      classes={{
        root: '',
        title: '',
      }}
    />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it('should display a notice on success.', () => {
    const success = 'Account information updated.';
    component.setState({ success });
    expect(component.containsMatchingElement(<Notice success text={success} />)).toBeTruthy();
  });

  it('should display a notice for a general error', () => {
    const errors = [{'reason': 'Something bad'}];
    component.setState({ errors });
    expect(component.containsMatchingElement(<Notice error text={'Something bad'} />)).toBeTruthy();
  });

  it('should not render the email form when loading', () => {
    expect(component.find('[data-qa-email-change]')).toHaveLength(1);
    component.setProps({ loading: true });
    expect(component.find('[data-qa-email-change]')).toHaveLength(0);
  });
});