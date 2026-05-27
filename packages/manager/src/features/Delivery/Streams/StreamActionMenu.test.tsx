import { streamStatus } from '@linode/api-v4';
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
      renderComponent(streamStatus.Active);

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Edit', 'Deactivate', 'Delete']) {
        expect(screen.getByText(action)).toBeVisible();
      }
    });
  });

  describe('when stream is inactive', () => {
    it('should include proper Stream actions', async () => {
      renderComponent(streamStatus.Inactive);

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Edit', 'Activate', 'Delete']) {
        expect(screen.getByText(action)).toBeVisible();
      }
    });
  });

  describe('when stream is provisioning', () => {
    it('should include proper Stream actions, only Edit enabled', async () => {
      renderComponent(streamStatus.Provisioning);

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Activate', 'Delete']) {
        expect(screen.getByRole('menuitem', { name: action })).toHaveAttribute(
          'aria-disabled',
          'true'
        );
      }

      expect(
        screen.getByRole('menuitem', { name: 'Edit' })
      ).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('when stream is deactivating', () => {
    it('should include proper Stream actions, only Edit enabled', async () => {
      renderComponent(streamStatus.Deactivating);

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Activate', 'Delete']) {
        expect(screen.getByRole('menuitem', { name: action })).toHaveAttribute(
          'aria-disabled',
          'true'
        );
      }

      expect(
        screen.getByRole('menuitem', { name: 'Edit' })
      ).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('when stream is failed', () => {
    it('should include proper Stream actions, only Activate disabled', async () => {
      renderComponent(streamStatus.Failed);

      const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

      await userEvent.click(actionMenuButton);

      for (const action of ['Delete', 'Edit']) {
        expect(
          screen.getByRole('menuitem', { name: action })
        ).not.toHaveAttribute('aria-disabled');
      }

      expect(
        screen.getByRole('menuitem', { name: 'Activate' })
      ).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
