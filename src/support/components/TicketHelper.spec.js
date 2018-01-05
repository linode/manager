import React from 'react';
import { shallow } from 'enzyme';

import TicketHelper from '~/support/components/TicketHelper';

describe('support/components/TicketHelper', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <TicketHelper />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('shows and hides faq sections on click', () => {
    const page = shallow(<TicketHelper />);

    expect(page.find('#availibility.hidden').length).toBe(1);

    page.find('LinkButton #availibility-button').simulate('click');

    expect(page.find('#availibility.hidden').length).toBe(0);
  });
});
