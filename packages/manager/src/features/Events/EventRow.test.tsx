import { shallow } from 'enzyme';
import * as React from 'react';
import { Row, RowProps } from './EventRow';

jest.mock('src/components/core/styles', () => ({
  ...(jest.requireActual('src/components/core/styles') as any),
  makeStyles: jest.fn(() => () => ({}))
}));

const message = 'this is a message.';
const props: RowProps = {
  action: 'linode_boot',
  duration: 0,
  message,
  type: 'linode',
  created: '2018-01-01',
  username: null,
  linkTarget: jest.fn(),
  eventMessage: null
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

  it("should only render an entity icon if it's not an events page for a specific entity", () => {
    row.setProps({ entityId: 1 });
    expect(row.find('[data-qa-entity-icon]')).toHaveLength(0);

    row.setProps({ entityId: 0 });
    expect(row.find('[data-qa-entity-icon]')).toHaveLength(1);
  });

  it("should only include a link if it's not an events page for a specific entity", () => {
    row.setProps({ entityId: 1 });
    let tableRowProps: any = row.find('[data-qa-event-row]').props();
    expect(tableRowProps.rowLink).toBe(undefined);

    row.setProps({ entityId: 0 });
    tableRowProps = row.find('[data-qa-event-row]').props();
    expect(tableRowProps.rowLink).toBeDefined();
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
