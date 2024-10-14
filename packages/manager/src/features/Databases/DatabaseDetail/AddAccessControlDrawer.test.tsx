import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { databaseFactory } from 'src/factories';
import { IPv4List } from 'src/factories/databases';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseInstance } from '@linode/api-v4';
import AccessControls from './AccessControls';
import AddAccessControlDrawer from './AddAccessControlDrawer';

beforeAll(() => mockMatchMedia());

describe('Add Access Controls drawer', () => {
  const database = databaseFactory.build();
  const { getByTestId, getByText } = renderWithTheme(
    <AccessControls database={database} />
  );
  const button = getByText('Manage Access Controls');

  fireEvent.click(button);

  it('Should open when a user clicks the Add Access Controls button', () => {
    // 'drawer' is the data-testid of the <Drawer /> component
    expect(getByTestId('drawer')).toBeVisible();
  });

  it('Should open with a full list of current inbound sources that are allow listed', async () => {
    const IPv4ListWithMasks = IPv4List.map((ip) => `${ip}/32`);
    const db = {
      id: 123,
      engine: 'postgresql',
      allow_list: IPv4ListWithMasks,
    } as DatabaseInstance;
    const { getAllByTestId } = renderWithTheme(
      <AddAccessControlDrawer database={db} onClose={() => null} open={true} />
    );

    expect(getAllByTestId('domain-transfer-input')).toHaveLength(
      IPv4List.length
    );

    await screen.findByDisplayValue(IPv4ListWithMasks[0]);
    await screen.findByDisplayValue(IPv4ListWithMasks[1]);
    await screen.findByDisplayValue(IPv4ListWithMasks[2]);
  });

  it('Should have a disabled Add Inbound Sources button until an inbound source field is touched', () => {
    const db = {
      id: 123,
      engine: 'postgresql',
      allow_list: IPv4List,
    } as DatabaseInstance;
    const { getByText } = renderWithTheme(
      <AddAccessControlDrawer database={db} onClose={() => null} open={true} />
    );

    const addAccessControlsButton = getByText('Update Access Controls').closest(
      'button'
    );

    // Before making a change to the IP addresses, the "Add Inbound Sources" button should be disabled.
    expect(addAccessControlsButton).toHaveAttribute('aria-disabled', 'true');

    const addAnIPButton = getByText('Add an IP');
    fireEvent.click(addAnIPButton);

    expect(addAccessControlsButton).toHaveAttribute('aria-disabled', 'false');
  });
});
