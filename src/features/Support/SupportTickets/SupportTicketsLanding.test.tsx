import { shallow } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  getSelectedTabFromQueryString,
  SupportTicketsLanding
} from './SupportTicketsLanding';

describe('Support Tickets Landing', () => {
  const component = shallow(
    <SupportTicketsLanding
      classes={{ root: '', title: '', titleWrapper: '' }}
      {...reactRouterProps}
    />
  );

  it('title of page should read "Customer Support"', () => {
    const titleText = component.find('[data-qa-breadcrumb]').prop('labelTitle');
    expect(titleText).toBe('Customer Support');
  });

  it('should have an Icon Text Link', () => {
    expect(component.find('[data-qa-open-ticket-link]')).toHaveLength(1);
  });

  it('icon text link text should read "Open New Ticket"', () => {
    const iconText = component.find('[data-qa-open-ticket-link]').prop('label');
    expect(iconText).toBe('Open New Ticket');
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
