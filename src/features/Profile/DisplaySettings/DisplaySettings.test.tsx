import { shallow } from 'enzyme';
import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';

describe('Email change form', () => {
  const update = jest.fn();

  const component = shallow(
    <DisplaySettings
      loading={false}
      username="exampleuser"
      email="me@this.com"
      timezone="America/Barbados"
      isLoggedInAsCustomer={false}
      actions={{
        updateProfile: update
      }}
      classes={{
        root: '',
        title: ''
      }}
    />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it('should not render the email form when loading', () => {
    expect(component.find('[data-qa-email-change]')).toHaveLength(1);
    component.setProps({ loading: true });
    expect(component.find('[data-qa-email-change]')).toHaveLength(0);
  });
});
