import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import { alertFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { GroupedAlertsTable } from './GroupedAlertsTable';

import type { Item } from '../constants';
import type { Alert, AlertServiceType } from '@linode/api-v4';
import type { GroupedBy } from '@linode/utilities';

const mockScrollToElement = vi.hoisted(() => vi.fn());

vi.mock('../Utils/AlertResourceUtils', () => ({
  scrollToElement: mockScrollToElement,
}));

const mockHandleDetails = vi.fn();
const mockHandleEdit = vi.fn();
const mockHandleStatusChange = vi.fn();

const mockServices: Item<string, AlertServiceType>[] = [
  { label: 'Linode', value: 'linode' },
  { label: 'Databases', value: 'dbaas' },
];

const mockAlerts: GroupedBy<Alert> = [
  [
    'tag1',
    [
      alertFactory.build({ label: 'Alert 1', tags: ['tag1'] }),
      alertFactory.build({ label: 'Alert 2', tags: ['tag1'] }),
    ],
  ],
  ['tag2', [alertFactory.build({ label: 'Alert 3', tags: ['tag2'] })]],
];

describe('GroupedAlertsTable', () => {
  it('should render grouped alerts by tag', () => {
    renderWithTheme(
      <GroupedAlertsTable
        groupedAlerts={mockAlerts}
        handleDetails={mockHandleDetails}
        handleEdit={mockHandleEdit}
        handleStatusChange={mockHandleStatusChange}
        services={mockServices}
      />
    );

    expect(screen.getByText('tag1')).toBeVisible();
    expect(screen.getByText('tag2')).toBeVisible();
    expect(screen.getByText('Alert 1')).toBeVisible();
    expect(screen.getByText('Alert 2')).toBeVisible();
    expect(screen.getByText('Alert 3')).toBeVisible();
  });

  it('should handle pagination properly', async () => {
    const alerts: GroupedBy<Alert> = [
      [
        'tag1',
        Array(50)
          .fill(null)
          .map(() => alertFactory.build({ tags: ['tag1'] })),
      ],
    ];

    renderWithTheme(
      <GroupedAlertsTable
        groupedAlerts={alerts}
        handleDetails={mockHandleDetails}
        handleEdit={mockHandleEdit}
        handleStatusChange={mockHandleStatusChange}
        services={mockServices}
      />
    );

    expect(screen.getByRole('button', { name: 'page 1' })).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Go to next page' })
    );
    expect(screen.getByRole('button', { name: 'page 2' })).toBeVisible();
  });

  it('should scroll to tag header when switching pages within tag pagination', async () => {
    const manyAlerts: GroupedBy<Alert> = [
      [
        'tag1',
        Array(50)
          .fill(null)
          .map(() => alertFactory.build({ tags: ['tag1'] })),
      ],
    ];

    renderWithTheme(
      <GroupedAlertsTable
        groupedAlerts={manyAlerts}
        handleDetails={mockHandleDetails}
        handleEdit={mockHandleEdit}
        handleStatusChange={mockHandleStatusChange}
        services={mockServices}
      />
    );

    // Find and click next page within tag1's pagination
    const nextPageButton = screen.getByRole('button', {
      name: 'Go to next page',
    });
    await userEvent.click(nextPageButton);

    const tagHeader = screen.getByRole('heading', { name: 'tag1' });
    expect(tagHeader).toBeVisible();

    // Ensure that the user is scrolled to the tag header
    expect(mockScrollToElement).toHaveBeenCalledWith(tagHeader);
  });
});
