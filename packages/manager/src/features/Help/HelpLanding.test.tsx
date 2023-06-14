import { shallow } from 'enzyme';
import * as React from 'react';

import { HelpLanding } from './HelpLanding';

describe('Help Landing', () => {
  const component = shallow(<HelpLanding />);
  xit('should render search panel', () => {
    expect(component.find('WithStyles(SearchPanel)')).toHaveLength(1);
  });

  it('should render popular posts panel', () => {
    expect(component.find('PopularPosts')).toHaveLength(1);
  });

  it('should render other ways panel', () => {
    expect(component.find('WithStyles(OtherWays)')).toHaveLength(1);
  });
});
