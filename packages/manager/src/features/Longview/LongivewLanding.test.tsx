import { shallow } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';

import { LongviewLanding } from './LongviewLanding';

describe('LongView Landing', () => {
  const component = shallow(<LongviewLanding {...reactRouterProps} />);
  it('should render a placeholder', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });
});
