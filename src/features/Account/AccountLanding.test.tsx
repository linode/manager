import { shallow } from 'enzyme';
import * as React from 'react';

import { AccountLanding } from './AccountLanding';

describe('Account Landing', () => {
  const component = shallow(
    <AccountLanding
      classes={{
        root: ''
      }}
    />
  );
  
  it('should do the thing...', () => {
    // do the thing
  });
});