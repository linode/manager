import { shallow } from 'enzyme';
import * as React from 'react';
import { Row, RowProps } from './EventRow';

const message = 'This is a message';
const props: RowProps = {
  message,
  type: 'linode',
  created: '2018-01-01',
  classes: {
    root: '',
    message: ''
  }
};

describe('EventRow component', () => {
  it('should render an event with a message', () => {
    const row = shallow(<Row {...props} />);
    expect(row.find('[data-qa-event-message]').contains(message)).toBe(true);
  });

  it("shouldn't render events without a message", () => {
    const emptyMessageProps = { ...props, message: undefined };
    expect(Row(emptyMessageProps)).toBeNull();
  });
});
