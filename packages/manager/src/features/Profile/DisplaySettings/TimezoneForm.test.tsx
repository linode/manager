import { shallow } from 'enzyme';
import * as React from 'react';

import { TimezoneForm, formatOffset } from './TimezoneForm';

describe('Timezone change form', () => {
  const updateProfile = jest.fn();

  const component = shallow(
    <TimezoneForm
      timezone={'Pacific/Niue'}
      updateTimezone={updateProfile}
      loggedInAsCustomer={true}
    />
  );

  it('should render .', () => {
    expect(component).toHaveLength(1);
  });

  it('should show a message if an admin is logged in as a customer', () => {
    expect(component.find('[data-qa-admin-notice]')).toHaveLength(1);
  });

  it('should not show a message if the user is logged in normally', () => {
    component.setProps({ loggedInAsCustomer: false });
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

describe('formatOffset', () => {
  it('formats the offset correctly', () => {
    const testMap = [
      { offset: -3.5, label: 'Newfoundland Time', formattedOffset: '-3:30' },
      { offset: 0, label: 'TrollTime', formattedOffset: '+0:00' },
      { offset: 5.75, label: 'Nepal Time', formattedOffset: '+5:45' },
      { offset: 13, label: 'New Zealand Time', formattedOffset: '+13:00' },
    ];

    testMap.forEach(({ offset, label, formattedOffset }) =>
      expect(formatOffset(offset, label)).toBe(
        `(GMT ${formattedOffset}) ${label}`
      )
    );
  });
});
