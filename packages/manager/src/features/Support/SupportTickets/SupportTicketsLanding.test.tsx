import { shallow } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  getSelectedTabFromQueryString,
  SupportTicketsLanding,
} from './SupportTicketsLanding';

describe('Support Tickets Landing', () => {
  const component = shallow(
    <SupportTicketsLanding
      globalErrors={{}}
      setErrors={jest.fn()}
      clearErrors={jest.fn()}
      {...reactRouterProps}
    />
  );

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

describe('getSelectedTabFromQueryString utility function', () => {
  it('should return 0 if ?type=open', () => {
    const url = 'cloud.linode.com/support/tickets?type=open';
    expect(getSelectedTabFromQueryString(url)).toBe(0);
  });

  it('should return 1 if ?type=closed', () => {
    const url = 'cloud.linode.com/support/tickets?type=closed';
    expect(getSelectedTabFromQueryString(url)).toBe(1);
  });

  it('should return 0 if type is unrecognized or not defined', () => {
    let url = 'cloud.linode.com/support/tickets?type=unknown';
    expect(getSelectedTabFromQueryString(url)).toBe(0);

    url = 'cloud.linode.com/support/tickets';
    expect(getSelectedTabFromQueryString(url)).toBe(0);
  });
});
