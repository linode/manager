import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { longviewPortFactory } from 'src/factories/longviewService';
import { renderWithTheme } from 'src/utilities/testHelpers';

import ActiveConnections, { TableProps } from './ActiveConnections';

const mockConnections = longviewPortFactory.buildList(10);

const props: TableProps = {
  connectionsLoading: false,
  connections: mockConnections
};

afterEach(cleanup);

describe('ActiveConnections (and by extension ListeningServices)', () => {
  it('should render a table with one row per active connection', () => {
    const { queryAllByTestId } = renderWithTheme(
      <ActiveConnections {...props} />
    );
    expect(queryAllByTestId('longview-connection-row')).toHaveLength(
      mockConnections.length
    );
  });

  it('should render a loading state', () => {
    const { getByTestId } = renderWithTheme(
      <ActiveConnections {...props} connectionsLoading={true} />
    );
    getByTestId('table-row-loading');
  });

  it('should render an empty state', () => {
    const { getByTestId } = renderWithTheme(
      <ActiveConnections {...props} connections={[]} />
    );
    getByTestId('table-row-empty');
  });

  it('should render an empty state', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <ActiveConnections
        {...props}
        connectionsLoading={true}
        connectionsError={'an error'}
      />
    );
    getByText('an error');
    getByTestId('table-row-error');
  });
});
