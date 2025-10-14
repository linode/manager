import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect } from 'vitest';

import { streamFactory } from 'src/factories/delivery';
import { StreamTableRow } from 'src/features/Delivery/Streams/StreamTableRow';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

const fakeHandler = vi.fn();

describe('StreamTableRow', () => {
  const stream = { ...streamFactory.build(), id: 1 };

  beforeEach(() => {
    vi.stubEnv('TZ', 'UTC');
  });

  it('should render a stream row', async () => {
    mockMatchMedia();
    renderWithTheme(
      wrapWithTableBody(
        <StreamTableRow
          onDelete={fakeHandler}
          onDisableOrEnable={fakeHandler}
          onEdit={fakeHandler}
          stream={stream}
        />
      )
    );

    // Name:
    screen.getByText('Stream 1');
    // Stream Type:
    screen.getByText('Audit Logs');
    // Status:
    screen.getByText('Active');
    // Destination Type:
    screen.getByText('Akamai Object Storage');
    // ID:
    screen.getByText('1');
    // Creation Time:
    screen.getByText(/2025-07-30/);

    const actionMenu = screen.getByLabelText(
      `Action menu for Stream ${stream.label}`
    );
    await userEvent.click(actionMenu);

    expect(screen.getByText('Edit')).toBeVisible();
    expect(screen.getByText('Deactivate')).toBeVisible();
    expect(screen.getByText('Delete')).toBeVisible();
  });
});
