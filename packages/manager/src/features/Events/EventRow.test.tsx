import * as React from 'react';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import { Row, RowProps } from './EventRow';

const message = 'this is a message.';
const props: RowProps = {
  action: 'linode_boot',
  message,
  type: 'linode',
  created: '2018-01-01',
  username: null,
};

describe('EventRow component', () => {
  it('should render an event with a message', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<Row {...props} />)
    );

    expect(getByText(message)).toBeInTheDocument();
  });

  it("shouldn't render events without a message", () => {
    const emptyMessageProps = { ...props, message: undefined };
    const { container } = renderWithTheme(
      wrapWithTableBody(<Row {...emptyMessageProps} />)
    );
    expect(container.closest('tr')).toBeNull();
  });

  it('should display the message with a username if one exists', () => {
    const username = 'banks';
    const propsWithUsername = { ...props, username };

    const { getByText } = renderWithTheme(
      wrapWithTableBody(<Row {...propsWithUsername} />)
    );

    expect(getByText(`this is a message by ${username}.`)).toBeInTheDocument();
  });
});
