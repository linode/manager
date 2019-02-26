import * as React from 'react';
import { shallow } from 'enzyme';

import { supportTicket } from 'src/__data__/supportTicket';

import TicketRow from './TicketRow';

const component = shallow(<TicketRow ticket={supportTicket} />);

describe('TicketList component', () => {
  it('should render', () => {
    expect(component).toHaveLength(1);
  });
});
