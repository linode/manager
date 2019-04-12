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
  },
  linkTarget: jest.fn(),
  isEventsLandingForEntity: false
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
    row.setProps({ isEventsLandingForEntity: true });
    expect(row.find('[data-qa-entity-icon]')).toHaveLength(0);

    row.setProps({ isEventsLandingForEntity: false });
    expect(row.find('[data-qa-entity-icon]')).toHaveLength(1);
  });

  it("should only include a link if it's not an events page for a specific entity", () => {
    row.setProps({ isEventsLandingForEntity: true });
    let tableRowProps: any = row
      .find('WithStyles(withRouter(TableRow))')
      .props();
    expect(tableRowProps.rowLink).toBe(undefined);

    row.setProps({ isEventsLandingForEntity: false });
    tableRowProps = row.find('WithStyles(withRouter(TableRow))').props();
    expect(tableRowProps.rowLink).toBeDefined();
  });
});
