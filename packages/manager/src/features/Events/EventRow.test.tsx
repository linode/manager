import { shallow } from 'enzyme';
import * as React from 'react';
import { maybeRemoveTrailingPeriod, Row, RowProps } from './EventRow';

const message = 'this is a message.';
const props: RowProps = {
  message,
  type: 'linode',
  created: '2018-01-01',
  username: null,
  classes: {
    root: '',
    message: ''
  },
  linkTarget: jest.fn()
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
    let tableRowProps: any = row
      .find('WithStyles(withRouter(TableRow))')
      .props();
    expect(tableRowProps.rowLink).toBe(undefined);

    row.setProps({ entityId: 0 });
    tableRowProps = row.find('WithStyles(withRouter(TableRow))').props();
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

describe('utilities', () => {
  it('should remove trailing periods', () => {
    expect(maybeRemoveTrailingPeriod('hello world.')).toBe('hello world');
    expect(maybeRemoveTrailingPeriod('hello wor..ld')).toBe('hello wor..ld');
    expect(maybeRemoveTrailingPeriod('hello world')).toBe('hello world');
    expect(maybeRemoveTrailingPeriod('hello. world')).toBe('hello. world');
  });
});
