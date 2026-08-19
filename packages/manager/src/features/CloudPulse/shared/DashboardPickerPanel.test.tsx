import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DashboardPickerPanel } from './DashboardPickerPanel';

import type { DashboardPickerPanelProps } from './DashboardPickerPanel';
import type { CloudPulseServiceType } from '@linode/api-v4';

const mockOnChange = vi.fn();
const mockHandleClose = vi.fn();
const selectedDashboardLabel = 'Storage Performance';
const alternateDashboardLabel = 'Resource Usage';

const options = [
  dashboardFactory.build({
    label: selectedDashboardLabel,
    service_type: 'linode',
  }),
  dashboardFactory.build({
    label: alternateDashboardLabel,
    service_type: 'linode',
  }),
];

const serviceTypeMap = new Map<CloudPulseServiceType, string>([
  ['linode', 'Linodes'],
]);
const value = options[0];

const baseProps: DashboardPickerPanelProps = {
  handleClose: mockHandleClose,
  onChange: mockOnChange,
  triggerLabel: 'Linodes - Storage Performance',
  triggerTextSx: () => ({
    color: '#000000',
    fontWeight: '700',
  }),
  options,
  serviceTypeMap,
  value,
};

describe('DashboardPickerPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger label, search input, and grouped options', () => {
    renderWithTheme(<DashboardPickerPanel {...baseProps} />);

    expect(
      screen.getByRole('dialog', { name: 'Dashboard picker' })
    ).toHaveAttribute('data-pendo-id', 'cloudpulse-dashboard-picker-panel');
    expect(screen.getByText('Linodes - Storage Performance')).toBeVisible();
    expect(
      screen.getByText('Linodes - Storage Performance').closest('button')
    ).toHaveAttribute('data-pendo-id', 'cloudpulse-dashboard-picker-close');
    expect(screen.getByPlaceholderText('Search')).toHaveAttribute(
      'data-pendo-id',
      'cloudpulse-dashboard-picker-search'
    );
    expect(screen.getByText('Linodes')).toBeVisible();
    expect(screen.getAllByText(selectedDashboardLabel).length).toBeGreaterThan(
      0
    );
    expect(
      screen.getByRole('option', { name: selectedDashboardLabel })
    ).toHaveAttribute(
      'data-pendo-id',
      `cloudpulse-dashboard-picker-option-${options[0].id}`
    );
  });

  it('hides service type headers when showServiceTypeLabel is false', () => {
    renderWithTheme(
      <DashboardPickerPanel {...baseProps} showServiceTypeLabel={false} />
    );

    expect(screen.queryByText('LINODES')).not.toBeInTheDocument();
  });

  it('calls onChange and handleClose when an option is selected', async () => {
    const user = userEvent.setup();

    renderWithTheme(<DashboardPickerPanel {...baseProps} />);

    await user.click(
      screen.getByRole('option', { name: alternateDashboardLabel })
    );

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(options[1]);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('shows empty state when filter has no matches', async () => {
    const user = userEvent.setup();

    renderWithTheme(<DashboardPickerPanel {...baseProps} />);

    await user.type(screen.getByPlaceholderText('Search'), 'does-not-exist');

    expect(screen.getByText('No dashboards found')).toBeVisible();
  });
});
