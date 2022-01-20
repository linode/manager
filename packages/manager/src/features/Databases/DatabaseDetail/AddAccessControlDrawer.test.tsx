import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
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
  const { getByText, getByTestId } = renderWithTheme(
    <AccessControls database={database} />
  );
  const button = getByText('Add Access Control');

  fireEvent.click(button);

  it('Should open when a user clicks the Add Access Controls button', () => {
    // 'drawer' is the data-testid of the <Drawer /> component
    expect(getByTestId('drawer')).toBeVisible();
  });

  it('Should open with a full list of current inbound sources that are allow listed', async () => {
    const { getAllByTestId } = renderWithTheme(
      <AddAccessControlDrawer
        open={true}
        onClose={() => null}
        updateDatabase={() => null}
        allowList={IPv4List.map(stringToExtendedIP)}
      />
    );

    expect(getAllByTestId('domain-transfer-input')).toHaveLength(
      IPv4List.length
    );

    await screen.findByDisplayValue(IPv4List[0]);
    await screen.findByDisplayValue(IPv4List[1]);
    await screen.findByDisplayValue(IPv4List[2]);
  });

  it('Should have a disabled Add Inbound Sources button until an inbound source field is touched', () => {
    const { getByText } = renderWithTheme(
      <AddAccessControlDrawer
        open={true}
        onClose={() => null}
        updateDatabase={() => null}
        allowList={IPv4List.map(stringToExtendedIP)}
      />
    );

    const addInboundSourcesButton = getByText('Add Inbound Sources').closest(
      'button'
    );

    // Before making a change to the IP addresses, the "Add Inbound Sources" button should be disabled.
    expect(addInboundSourcesButton).toBeDisabled();

    const addAnIPButton = getByText('Add an IP');
    fireEvent.click(addAnIPButton);

    expect(addInboundSourcesButton).toBeEnabled();
  });
});
