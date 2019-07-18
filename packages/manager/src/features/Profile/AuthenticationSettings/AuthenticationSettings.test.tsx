import { shallow } from 'enzyme';
import * as React from 'react';

import { AuthenticationSettings } from './AuthenticationSettings';

describe('Authentication settings profile tab', () => {
  const update = jest.fn();

  const component = shallow(
    <AuthenticationSettings
      loading={false}
      ipWhitelisting={true}
      twoFactor={true}
      username={'username'}
      updateProfile={update}
      classes={{
        root: '',
        title: ''
      }}
    />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });

  it('should not render the whitelisting form when loading', () => {
    expect(component.find('[data-qa-whitelisting-form]')).toHaveLength(1);
    component.setProps({ loading: true });
    expect(component.find('[data-qa-whitelisting-form]')).toHaveLength(0);
    component.setProps({ loading: false });
  });

  it('should not render the whitelisting form if the user does not have this setting enabled', () => {
    expect(component.find('[data-qa-whitelisting-form]')).toHaveLength(1);
    component.setProps({ ipWhitelisting: false });
    expect(component.find('[data-qa-whitelisting-form]')).toHaveLength(0);
  });
});
