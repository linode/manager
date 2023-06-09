import * as React from 'react';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import { Row, RowProps } from './EventRow';
import { DateTime } from 'luxon';

const message = 'this is a message.';
const props: RowProps = {
  action: 'linode_boot',
  message,
  type: 'linode',
  username: null,
  timestamp: DateTime.now(),
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
});
