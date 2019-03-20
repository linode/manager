import 'jest-dom/extend-expect';
import * as React from 'react';
import { cleanup } from 'react-testing-library';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Row, RowProps } from './EventRow';

afterEach(cleanup);

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
    const { container } = renderWithTheme(
      <table>
        <tbody>
          <Row {...props} />
        </tbody>
      </table>
    );
    expect(container).toHaveTextContent(message);
  });

  it("shouldn't render events without a message", () => {
    const emptyMessageProps = { ...props, message: undefined };
    expect(Row(emptyMessageProps)).toBeNull();
  });
});
