/* eslint-disable testing-library/prefer-screen-queries */
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

describe('PlatformMaintenanceBanner', () => {
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
        status: 'in-progress',
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
          '2 Linodes have upcoming scheduled maintenance. For more details, view Account Maintenance.'
      )[0]
    ).toBeVisible();

    expect(
      getAllByText(
        (_, el) =>
          el?.textContent ===
          '1 Linode has upcoming emergency maintenance. For more details, view Account Maintenance.'
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
});
