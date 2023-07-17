import * as React from 'react';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import { MonitorActionMenu, Props } from './MonitorActionMenu';

const props: Props = {
  label: 'this-monitor',
  monitorID: 1,
  openDialog: jest.fn(),
  openHistoryDrawer: jest.fn(),
  openMonitorDrawer: jest.fn(),
  status: 'disabled',
};

describe('Monitor action menu', () => {
  it('should include basic Monitor actions', () => {
    const { queryByText } = renderWithTheme(
      <MonitorActionMenu {...props} status="disabled" />
    );
    includesActions(['View Issue History', 'Edit', 'Delete'], queryByText);
  });

  it('should include Enable if the monitor is disabled', () => {
    const { queryByText } = renderWithTheme(
      <MonitorActionMenu {...props} status="disabled" />
    );
    includesActions(['Enable'], queryByText);
    expect(queryByText('Disable')).toBeNull();
  });

  it('should include Disable if the monitor is enabled', () => {
    const { queryByText } = renderWithTheme(
      <MonitorActionMenu {...props} status="ok" />
    );
    includesActions(['Disable'], queryByText);
    expect(queryByText('Enable')).toBeNull();
  });
});
