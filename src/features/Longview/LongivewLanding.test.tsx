import { shallow } from 'enzyme';
import * as React from 'react';

import { LongviewLanding } from './LongviewLanding';

describe('LongView Landing', () => {
  const component = shallow(
    <LongviewLanding />
  );
  it('should render a placeholder', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });
});
