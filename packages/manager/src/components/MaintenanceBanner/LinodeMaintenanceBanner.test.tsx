/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react';

import { accountMaintenanceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeMaintenanceBanner } from './LinodeMaintenanceBanner';

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

describe('PlatformMaintenanceBanner', () => {
  it('renders with maintenance date', () => {
    const mockMaintenance = [
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', label: 'linode-1', id: 1 },
        reason: 'Scheduled maintenance',
        status: 'pending',
        description: 'scheduled',
        start_time: '2025-05-28T19:21:00',
      }),
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', id: 2 },
        reason: 'Another scheduled maintenance',
        status: 'in-progress',
        description: 'scheduled',
      }),
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', id: 3 },
        reason: 'Emergency maintenance',
        status: 'scheduled',
        description: 'emergency',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    const { getAllByText } = renderWithTheme(
      <LinodeMaintenanceBanner linodeId={1} />
    );

    expect(
      getAllByText(
        (_, el) =>
          el?.textContent ===
          'Linode linode-1 scheduled maintenance reboot will begin 05/28/2025 at 15:21. For more details, view Account Maintenance.'
      )[0]
    ).toBeVisible();
  });

  it('does not render when there is no related maintenance', () => {
    const mockMaintenance = [
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', id: 2 },
        reason: 'Another scheduled maintenance',
        status: 'in-progress',
        description: 'scheduled',
      }),
      accountMaintenanceFactory.build({
        type: 'reboot',
        entity: { type: 'linode', id: 3 },
        reason: 'Emergency maintenance',
        status: 'scheduled',
        description: 'emergency',
      }),
    ];

    queryMocks.useAllAccountMaintenanceQuery.mockReturnValue({
      data: mockMaintenance,
    });

    const { queryByText } = renderWithTheme(
      <LinodeMaintenanceBanner linodeId={1} />
    );

    expect(
      queryByText(
        (_, el) =>
          el?.textContent ===
          'Linode linode-1 scheduled maintenance reboot will begin 05/28/2025 at 15:21. For more details, view Account Maintenance.'
      )
    ).not.toBeInTheDocument();
  });
});
