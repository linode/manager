import { shallow } from 'enzyme';
import * as React from 'react';

import { TimezoneForm } from './TimezoneForm';

describe('Email change form', () => {
  const updateProfile = jest.fn();
  
  const component = shallow(
      <TimezoneForm
        classes={{
          root: '',
          select: '',
          title: '',
        }}
        timezone={'Europe/San_Marino'}
        updateProfile={updateProfile}
      />,
  );

  it('should render .', () => {
    expect(component).toHaveLength(1);
  });

  it('should include text with the user\'s current time zone', () => {
    expect(component.find('[data-qa-copy]').html()).toContain('Europe/San_Marino');
  });

  it('should have a select with the user\'s current timezone selected', () => {
    expect(component.find('[data-qa-tz-select]').props().value).toBe('Europe/San_Marino');
  });
});
