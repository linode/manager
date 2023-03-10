import { render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  getSelectedTabFromQueryString,
  SupportTicketsLanding,
} from './SupportTicketsLanding';

describe('Support Tickets Landing', () => {
  const component = render(
    <SupportTicketsLanding
      globalErrors={{}}
      setErrors={jest.fn()}
      clearErrors={jest.fn()}
      {...reactRouterProps}
    />
  );

  it('should render a title that reads "Tickets"', () => {
    const titleText = component.getByText('Tickets');
    expect(titleText).toBeInTheDocument();
  });

  it('should have an Open New Ticket Button', () => {
    const openTicketButton = component.getByText('Open New Ticket');
    expect(openTicketButton).toBeInTheDocument();
  });

  it('button text should read "Open New Ticket"', () => {
    const openTicketButton = component.getByText('Open New Ticket');
    expect(openTicketButton).toBeInTheDocument();
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
