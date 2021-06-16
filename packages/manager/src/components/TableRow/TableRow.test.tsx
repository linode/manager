import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import TableCell from 'src/components/TableCell';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { CombinedProps, TableRow } from './TableRow';

const mockHistoryPush = jest.fn();

const props: CombinedProps = {
  classes: {
    root: '',
    selected: '',
  },
  ...reactRouterProps,
  history: {
    ...reactRouterProps.history,
    push: mockHistoryPush,
  },
  staticContext: undefined,
};

describe('TableRow component', () => {
  it.skip('calls history.push with the given rowLink', () => {
    const { getByText } = render(
      wrapWithTableBody(
        <TableRow {...(props as any)} rowLink={'/test-url'}>
          <TableCell>Test Text</TableCell>
        </TableRow>
      )
    );

    fireEvent.click(getByText('Test Text'));
    expect(mockHistoryPush).toHaveBeenCalledWith('/test-url');
  });
});
