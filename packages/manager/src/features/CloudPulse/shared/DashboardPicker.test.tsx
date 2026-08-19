import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DashboardPicker } from './DashboardPicker';

import type { DashboardPickerPanelProps } from './DashboardPickerPanel';
import type { CloudPulseServiceType } from '@linode/api-v4';

const panelMocks = vi.hoisted(() => ({
  render: vi.fn(),
}));
const triggerTestId = 'dashboard-picker-trigger';
const panelTestId = 'dashboard-picker-panel';

vi.mock('./DashboardPickerPanel', () => ({
  DashboardPickerPanel: (props: DashboardPickerPanelProps) => {
    panelMocks.render(props);

    return (
      <div data-testid={panelTestId}>
        <span>{props.triggerLabel}</span>
        <button onClick={props.handleClose} type="button">
          Close Panel
        </button>
      </div>
    );
  },
}));

const mockOnChange = vi.fn();

const selectedDashboard = dashboardFactory.build({
  label: 'Storage Performance',
  service_type: 'linode',
});

const serviceTypeMap = new Map<CloudPulseServiceType, string>([
  ['linode', 'Linodes'],
]);

describe('DashboardPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default trigger text when no dashboard is selected', () => {
    renderWithTheme(
      <DashboardPicker
        onChange={mockOnChange}
        options={[]}
        serviceTypeMap={serviceTypeMap}
        value={null}
      />
    );

    expect(screen.getByText('Select a Dashboard')).toBeVisible();
    expect(screen.getByTestId(triggerTestId)).toHaveAttribute(
      'data-pendo-id',
      'cloudpulse-dashboard-picker-trigger'
    );
  });

  it('adds a Pendo identifier to the contextual navigation link', () => {
    renderWithTheme(
      <DashboardPicker
        isContextualView
        onChange={mockOnChange}
        options={[]}
        serviceTypeMap={serviceTypeMap}
        value={null}
      />
    );

    expect(screen.getByText('Monitor all services')).toHaveAttribute(
      'data-pendo-id',
      'cloudpulse-dashboard-picker-monitor-all-services'
    );
  });

  it('renders selected trigger text when a dashboard is selected', () => {
    renderWithTheme(
      <DashboardPicker
        onChange={mockOnChange}
        options={[selectedDashboard]}
        serviceTypeMap={serviceTypeMap}
        value={selectedDashboard}
      />
    );

    expect(screen.getByText('Linodes - Storage Performance')).toBeVisible();
  });

  it('opens the panel on trigger click and closes it from panel action', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <DashboardPicker
        onChange={mockOnChange}
        options={[selectedDashboard]}
        serviceTypeMap={serviceTypeMap}
        value={selectedDashboard}
      />
    );

    await user.click(screen.getByTestId(triggerTestId));

    expect(screen.getByTestId(panelTestId)).toBeVisible();
    expect(panelMocks.render).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Close Panel' }));

    expect(screen.queryByTestId(panelTestId)).not.toBeInTheDocument();
  });

  it('does not open the panel when disabled', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <DashboardPicker
        disabled
        onChange={mockOnChange}
        options={[selectedDashboard]}
        serviceTypeMap={serviceTypeMap}
        value={selectedDashboard}
      />
    );

    await user.click(screen.getByTestId(triggerTestId));

    expect(screen.queryByTestId(panelTestId)).not.toBeInTheDocument();
  });

  it('passes showServiceTypeLabel down to panel', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <DashboardPicker
        onChange={mockOnChange}
        options={[selectedDashboard]}
        serviceTypeMap={serviceTypeMap}
        showServiceTypeLabel={false}
        value={selectedDashboard}
      />
    );

    await user.click(screen.getByTestId(triggerTestId));

    const latestCall = panelMocks.render.mock.calls.at(-1)?.[0];
    expect(latestCall?.showServiceTypeLabel).toBe(false);
  });
});
