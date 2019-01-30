import { shallow } from 'enzyme';
import * as React from 'react';

import { ManagedLanding } from './ManagedLanding';

describe('Managed Landing', () => {
  const component = shallow(
    <ManagedLanding
      classes={{
        root: ''
      }}
    />
  );
  it('should render a placeholder', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });
});
