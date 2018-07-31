import { shallow } from 'enzyme';
import * as React from 'react';

import { SupportTicketsLanding } from './SupportTicketsLanding';

import { reactRouterProps } from 'src/__data__/reactRouterProps';

describe('Support Tickets Landing', () => {
  const component = shallow(
    <SupportTicketsLanding
      classes={{ root: '', title: '' }}
      {...reactRouterProps}
    />
  )

  it('title of page should read "Customer Support"', () => {
    const titleText = component.find('WithStyles(Typography)[variant="headline"]')
    .children().text();
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
