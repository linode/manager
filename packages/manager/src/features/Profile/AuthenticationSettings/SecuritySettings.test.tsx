import { shallow } from 'enzyme';
import * as React from 'react';

import { SecuritySettings } from './SecuritySettings';

describe('Security settings (IP allowlisting) form', () => {
  const onSuccess = jest.fn();
  const updateProfile = jest.fn();

  const component = shallow(
    <SecuritySettings
      classes={{
        root: '',
        title: '',
      }}
      ipAllowlistingEnabled={false}
      onSuccess={onSuccess}
      updateProfile={updateProfile}
    />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });
});
