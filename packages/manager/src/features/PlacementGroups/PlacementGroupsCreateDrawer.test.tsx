import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsCreateDrawer } from './PlacementGroupsCreateDrawer';

const commonProps = {
  disabledCreateButton: false,
  onClose: vi.fn(),
  onPlacementGroupCreated: vi.fn(),
  open: true,
};

describe('PlacementGroupsCreateDrawer', () => {
  it('should render and have its fields enabled', () => {
    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={0}
        {...commonProps}
      />
    );

    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Region')).toBeEnabled();
    expect(getByLabelText('Affinity Type')).toBeEnabled();
  });

  it('Affinity Type select should have the correct options', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={0}
        {...commonProps}
      />
    );

    const inputElement = getByPlaceholderText('Select an Affinity Type');
    fireEvent.focus(inputElement);

    fireEvent.change(inputElement, { target: { value: 'Affinity' } });
    expect(getByText('Affinity')).toBeInTheDocument();

    fireEvent.change(inputElement, { target: { value: 'Anti-affinity' } });
    expect(getByText('Anti-affinity')).toBeInTheDocument();
  });

  it('should disable the submit button when the number of placement groups created is >= to the max', () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={5}
        {...commonProps}
      />
    );

    expect(getByTestId('submit')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should populate the region select with the selected region prop', async () => {
    server.use(
      rest.get('*/regions', (req, res, ctx) => {
        const regions = regionFactory.buildList(1, {
          id: 'us-east',
          label: 'Newark, NJ',
          capabilities: ['Linodes'],
        });
        return res(ctx.json(makeResourcePage(regions)));
      })
    );

    const { getByLabelText } = renderWithTheme(
      <PlacementGroupsCreateDrawer
        numberOfPlacementGroupsCreated={0}
        selectedRegionId="us-east"
        {...commonProps}
      />
    );

    await waitFor(() => {
      expect(getByLabelText('Region')).toHaveValue('Newark, NJ (us-east)');
    });
  });
});
