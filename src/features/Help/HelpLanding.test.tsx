import { shallow } from 'enzyme';
import * as React from 'react';

import { HelpLanding } from './HelpLanding';

describe('Help Landing', () => {
  const component = shallow(
    <HelpLanding 
      classes={{
        root: '',
      }}
    />
  )
  it('should do the thing...', () => {
    expect(component);
  });
});