import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import TicketHelper from '~/support/components/TicketHelper';

describe('support/components/TicketHelper', () => {
  it('shows and hides faq sections on click', () => {
    const page = mount(<TicketHelper />);
    expect(page.find('#availibility.hidden').length).to.equal(1);

    page.find('#availibility-button').simulate('click');

    expect(page.find('#availibility.hidden').length).to.equal(0);
  });
});
