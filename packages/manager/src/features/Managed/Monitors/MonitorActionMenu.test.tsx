import * as React from 'react';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';
import { Props, MonitorActionMenu } from './MonitorActionMenu';

const props: Props = {
  status: 'disabled',
  label: 'this-monitor',
  openDialog: jest.fn(),
  monitorID: 1,
  openMonitorDrawer: jest.fn(),
  openHistoryDrawer: jest.fn(),
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
