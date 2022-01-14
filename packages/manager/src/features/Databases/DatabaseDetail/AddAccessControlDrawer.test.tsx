import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { databaseFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';
import AccessControls from './AccessControls';
// import { IPv4List } from 'src/factories/databases';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('Add Access Controls drawer', () => {
  const database = databaseFactory.build();
  const { getByText, getByTestId, getAllByTestId } = renderWithTheme(
    <AccessControls database={database} />
  );
  const button = getByText('Add Access Control');

  fireEvent.click(button);

  it('Should open when a user clicks the Add Access Controls button', () => {
    // 'drawer' is the data-testid of the <Drawer /> component
    expect(getByTestId('drawer')).toBeVisible();
  });

  it('Should open with a full list of current inbound sources that are allow listed', async () => {});

  it('Should have a disabled Add Inbound Sources button until an inbound source field is touched', () => {});
});
