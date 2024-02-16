import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { regionFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsEditDrawer } from './PlacementGroupsEditDrawer';

const queryMocks = vi.hoisted(() => ({
  useMutatePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
  useParams: vi.fn().mockReturnValue({}),
  usePlacementGroupQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useMutatePlacementGroup: queryMocks.useMutatePlacementGroup,
    usePlacementGroupQuery: queryMocks.usePlacementGroupQuery,
  };
});

describe('PlacementGroupsCreateDrawer', () => {
  it('should render, have the proper fields populated with PG values, and have uneditable fields disabled', async () => {
    server.use(
      rest.get('*/regions', (req, res, ctx) => {
        const regions = regionFactory.buildList(1, {
          capabilities: ['Linodes'],
          id: 'us-east',
          label: 'Fake Region, NC',
        });
        return res(ctx.json(makeResourcePage(regions)));
      })
    );

    const { getByLabelText, getByRole, getByText } = renderWithTheme(
      <PlacementGroupsEditDrawer
        onClose={vi.fn()}
        onPlacementGroupEdit={vi.fn()}
        open={true}
      />
    );

    expect(
      getByRole('heading', {
        name: 'Edit Placement Group PG-to-edit (Anti-affinity)',
      })
    ).toBeInTheDocument();
    expect(getByText('Newark, NJ (us-east)')).toBeInTheDocument();
    expect(getByLabelText('Label')).toBeEnabled();
    expect(getByLabelText('Label')).toHaveValue('PG-to-edit');
    expect(getByRole('button', { name: 'Cancel' })).toBeEnabled();
    // const editButton = getByRole('button', { name: 'Edit' });

    expect(getByLabelText('Region')).toBeDisabled();

    await waitFor(() => {
      expect(getByLabelText('Region')).toHaveValue('Fake Region, NC (us-east)');
    });

    expect(queryMocks.useMutatePlacementGroup).toHaveBeenCalled();
  });
});
