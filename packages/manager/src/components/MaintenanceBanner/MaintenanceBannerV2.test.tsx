import React from 'react';

import { accountMaintenanceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaintenanceBannerV2 } from './MaintenanceBannerV2';

const queryMocks = vi.hoisted(() => ({
  useAllAccountMaintenanceQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    ...queryMocks,
  };
});

describe('MaintenanceBannerV2', () => {
  it('renders with count of affected linodes', () => {
    const mockMaintenance = [
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode' },
        reason: 'Scheduled maintenance',
        status: 'pending',
        description: 'scheduled',
      }),
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode' },
        reason: 'Another scheduled maintenance',
        status: 'in_progress',
        description: 'scheduled',
      }),
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode' },
        reason: 'Emergency maintenance',
        status: 'scheduled',
        description: 'emergency',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    const { getAllByText } = renderWithTheme(<MaintenanceBannerV2 />);

    expect(
      getAllByText(
        (_, el) =>
          el?.textContent ===
          '3 Linodes have upcoming scheduled maintenance. For more details, view Account Maintenance.'
      )[0]
    ).toBeVisible();
  });

  it('does not render when there is no non-platform maintenance', () => {
    const mockMaintenance = [
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode' },
        reason: 'Critical platform maintenance',
        status: 'pending',
        description: 'scheduled',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    const { queryByText } = renderWithTheme(<MaintenanceBannerV2 />);

    expect(
      queryByText((text) =>
        text.includes('For more details, view Account Maintenance.')
      )
    ).not.toBeInTheDocument();
  });

  it('does not show Account Maintenance link when pathname is /maintenance', () => {
    const mockMaintenance = [
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', id: 123 },
        reason: 'Scheduled maintenance',
        status: 'pending',
        description: 'scheduled',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    const { queryByTestId } = renderWithTheme(<MaintenanceBannerV2 />, {
      initialRoute: '/maintenance',
    });

    // Should show the maintenance banner but not the maintenance link section
    expect(queryByTestId('maintenance-link-section')).not.toBeInTheDocument();
  });

  it('shows Account Maintenance link when pathname is not /maintenance', () => {
    const mockMaintenance = [
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', id: 123 },
        reason: 'Scheduled maintenance',
        status: 'pending',
        description: 'scheduled',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    const { getByTestId } = renderWithTheme(<MaintenanceBannerV2 />, {
      initialRoute: '/dashboard',
    });

    // Should show the maintenance banner AND the maintenance link section
    getByTestId('maintenance-link-section');
  });
});
