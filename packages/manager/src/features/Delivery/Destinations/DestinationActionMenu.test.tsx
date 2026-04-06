import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { akamaiObjectStorageDestinationFactory } from 'src/factories';
import { DestinationActionMenu } from 'src/features/Delivery/Destinations/DestinationActionMenu';
import { renderWithTheme } from 'src/utilities/testHelpers';

const fakeHandler = vi.fn();

describe('DestinationActionMenu', () => {
  it('should include proper Stream actions', async () => {
    renderWithTheme(
      <DestinationActionMenu
        destination={akamaiObjectStorageDestinationFactory.build()}
        onDelete={fakeHandler}
        onEdit={fakeHandler}
      />
    );

    const actionMenuButton = screen.queryByLabelText(/^Action menu for/)!;

    await userEvent.click(actionMenuButton);

    for (const action of ['Edit', 'Delete']) {
      expect(screen.getByText(action)).toBeVisible();
    }
  });
});
