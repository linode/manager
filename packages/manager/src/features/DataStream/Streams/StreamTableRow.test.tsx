import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect } from 'vitest';

import { streamFactory } from 'src/factories/datastream';
import { StreamTableRow } from 'src/features/DataStream/Streams/StreamTableRow';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

const fakeHandler = vi.fn();

describe('StreamTableRow', () => {
  const stream = { ...streamFactory.build(), id: 1 };

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
    screen.getByText('Data Stream 1');
    // Stream Type:
    screen.getByText('Audit Logs');
    // Status:
    screen.getByText('Enabled');
    // Destination Type:
    screen.getByText('Linode Object Storage');
    // ID:
    screen.getByText('1');
    // Creation Time:
    screen.getByText(/2025-07-30/);

    const actionMenu = screen.getByLabelText(
      `Action menu for Stream ${stream.label}`
    );
    await userEvent.click(actionMenu);

    expect(screen.getByText('Edit')).toBeVisible();
    expect(screen.getByText('Disable')).toBeVisible();
    expect(screen.getByText('Delete')).toBeVisible();
  });
});
