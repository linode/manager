import { shallow } from 'enzyme';
import * as React from 'react';
import { Row, RowProps } from './EventRow';

jest.mock('src/components/core/styles', () => ({
  ...(jest.requireActual('src/components/core/styles') as any),
  makeStyles: jest.fn(() => () => ({})),
}));

const message = 'this is a message.';
const props: RowProps = {
  action: 'linode_boot',
  message,
  type: 'linode',
  created: '2018-01-01',
  username: null,
};

describe('EventRow component', () => {
  const row = shallow<RowProps>(<Row {...props} />);

  it('should render an event with a message', () => {
    expect(row.find('[data-qa-event-message]').contains(message)).toBe(true);
  });

  it("shouldn't render events without a message", () => {
    const emptyMessageProps = { ...props, message: undefined };
    expect(Row(emptyMessageProps)).toBeNull();
  });

  it('should display the message with a username if one exists', () => {
    expect(row.find(`[data-qa-event-message]`).text()).toBe(
      'this is a message.'
    );
    row.setProps({ username: 'marty' });
    expect(row.find(`[data-qa-event-message]`).text()).toBe(
      'this is a message by marty.'
    );
  });
});
