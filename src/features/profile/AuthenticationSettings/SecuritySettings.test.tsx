import { shallow } from 'enzyme';
import * as React from 'react';

import { SecuritySettings } from './SecuritySettings';

describe('Email change form', () => {
  const onSuccess = jest.fn();
  const updateProfile = jest.fn();

  const component = shallow(
      <SecuritySettings
        classes={{
          root: '',
          title: '',
        }}
        onSuccess={onSuccess}
        updateProfile={updateProfile}
      />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it('the confirm button should be disabled', () => {
    expect(component.find('[data-qa-confirm]').props().disabled).toBeTruthy();
  });

  it('the confirm button should be enabled when the toggle is set to "Disabled"', () => {
    component.setState({ ipWhitelistingToggle: false });
    component.update();
    expect(component.find('[data-qa-confirm]').props().disabled).toBeFalsy();
  });
});
