import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from '@tanstack/react-query';

import { databaseFactory } from 'src/factories';
import { IPv4List } from 'src/factories/databases';
import { stringToExtendedIP } from 'src/utilities/ipUtils';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import AccessControls from './AccessControls';
import AddAccessControlDrawer from './AddAccessControlDrawer';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

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
    const { getAllByTestId } = renderWithTheme(
      <AddAccessControlDrawer
        allowList={IPv4ListWithMasks.map(stringToExtendedIP)}
        onClose={() => null}
        open={true}
        updateDatabase={() => null}
      />
    );

    expect(getAllByTestId('domain-transfer-input')).toHaveLength(
      IPv4List.length
    );

    await screen.findByDisplayValue(IPv4ListWithMasks[0]);
    await screen.findByDisplayValue(IPv4ListWithMasks[1]);
    await screen.findByDisplayValue(IPv4ListWithMasks[2]);
  });

  it('Should have a disabled Add Inbound Sources button until an inbound source field is touched', () => {
    const { getByText } = renderWithTheme(
      <AddAccessControlDrawer
        allowList={IPv4List.map(stringToExtendedIP)}
        onClose={() => null}
        open={true}
        updateDatabase={() => null}
      />
    );

    const addAccessControlsButton = getByText('Update Access Controls').closest(
      'button'
    );

    // Before making a change to the IP addresses, the "Add Inbound Sources" button should be disabled.
    expect(addAccessControlsButton).toBeDisabled();

    const addAnIPButton = getByText('Add an IP');
    fireEvent.click(addAnIPButton);

    expect(addAccessControlsButton).toBeEnabled();
  });
});
