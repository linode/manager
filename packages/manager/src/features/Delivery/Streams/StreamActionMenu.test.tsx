import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { streamFactory } from 'src/factories';
import { StreamActionMenu } from 'src/features/Delivery/Streams/StreamActionMenu';
import { renderWithTheme } from 'src/utilities/testHelpers';

import type { StreamStatus } from '@linode/api-v4';

const fakeHandler = vi.fn();

describe('StreamActionMenu', () => {
  const renderComponent = (status: StreamStatus) => {
    renderWithTheme(
      <StreamActionMenu
        onDelete={fakeHandler}
        onDisableOrEnable={fakeHandler}
        onEdit={fakeHandler}
        stream={streamFactory.build({ status })}
      />
    );
  };

  describe('when stream is active', () => {
    it('should include proper Stream actions', async () => {
      renderComponent('active');

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Edit', 'Deactivate', 'Delete']) {
        expect(screen.getByText(action)).toBeVisible();
      }
    });
  });

  describe('when stream is inactive', () => {
    it('should include proper Stream actions', async () => {
      renderComponent('inactive');

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Edit', 'Activate', 'Delete']) {
        expect(screen.getByText(action)).toBeVisible();
      }
    });
  });
});
