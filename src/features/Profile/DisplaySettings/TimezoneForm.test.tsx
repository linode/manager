import { shallow } from 'enzyme';
import * as React from 'react';

import { TimezoneForm } from './TimezoneForm';

describe('Timezone change form', () => {
  const updateProfile = jest.fn();

  const component = shallow(
    <TimezoneForm
      classes={{
        root: '',
        title: ''
      }}
      timezone={'Pacific/Niue'}
      updateProfile={updateProfile}
      isLoggedInAsCustomer={true}
    />
  );

  it('should render .', () => {
    expect(component).toHaveLength(1);
  });

  it('should show a message if an admin is logged in as a customer', () => {
    expect(component.find('[data-qa-admin-notice]')).toHaveLength(1);
  });

  it('should not show a message if the user is logged in normally', () => {
    component.setProps({ isLoggedInAsCustomer: false });
    expect(component.find('[data-qa-admin-notice]')).toHaveLength(0);
  });

  xit("should include text with the user's current time zone", () => {
    expect(component.find('[data-qa-copy]').html()).toContain(
      'Europe/San_Marino'
    );
  });

  xit("should have a select with the user's current timezone selected", () => {
    expect(component.find('[data-qa-tz-select]').props().value).toBe(
      'Europe/San_Marino'
    );
  });
});
