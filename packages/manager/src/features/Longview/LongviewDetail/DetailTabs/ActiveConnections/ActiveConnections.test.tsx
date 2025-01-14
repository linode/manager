import * as React from 'react';

import { longviewPortFactory } from 'src/factories/longviewService';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { ActiveConnections } from './ActiveConnections';

import type { TableProps } from './ActiveConnections';

const mockConnections = longviewPortFactory.buildList(10);

const props: TableProps = {
  connections: mockConnections,
  connectionsLoading: false,
};

describe('ActiveConnections (and by extension ListeningServices)', () => {
  it('should render a table with one row per active connection', async () => {
    const { queryAllByTestId } = await renderWithThemeAndRouter(
      <ActiveConnections {...props} />
    );
    expect(queryAllByTestId('longview-connection-row')).toHaveLength(
      mockConnections.length
    );
  });

  it('should render a loading state', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(
      <ActiveConnections {...props} connectionsLoading={true} />
    );
    getByTestId('table-row-loading');
  });

  it('should render an empty state', async () => {
    const { getByTestId } = await renderWithThemeAndRouter(
      <ActiveConnections {...props} connections={[]} />
    );
    getByTestId('table-row-empty');
  });

  it('should render an error state', async () => {
    const { getByTestId, getByText } = await renderWithThemeAndRouter(
      <ActiveConnections
        {...props}
        connectionsError={'an error'}
        connectionsLoading={true}
      />
    );
    getByText('an error');
    getByTestId('table-row-error');
  });
});
