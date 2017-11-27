import React from 'react';
import { mount } from 'enzyme';

import TicketHelper from '~/support/components/TicketHelper';

describe('support/components/TicketHelper', () => {
  it('shows and hides faq sections on click', () => {
    const page = mount(<TicketHelper />);
    expect(page.find('#availibility.hidden').length).toBe(1);

    page.find('#availibility-button').simulate('click');

    expect(page.find('#availibility.hidden').length).toBe(0);
  });
});
