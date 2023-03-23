import { shallow } from 'enzyme';
import * as React from 'react';
import SupportTicketsLanding from './SupportTicketsLanding';

describe('Support Tickets Landing', () => {
  const component = shallow(<SupportTicketsLanding />);

  it('should render a <LandingHeader />', () => {
    expect(component.find('LandingHeader')).toHaveLength(1);
  });

  it('should render a <LandingHeader /> with a title prop', () => {
    expect(component.find('LandingHeader').prop('title')).toBeDefined();
  });

  it('should render a <LandingHeader /> with a createButtonText prop', () => {
    expect(
      component.find('LandingHeader').prop('createButtonText')
    ).toBeDefined();
  });
});
