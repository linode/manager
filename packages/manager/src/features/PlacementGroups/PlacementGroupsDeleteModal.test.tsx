import { act, fireEvent } from '@testing-library/react';
import * as React from 'react';

import {
  linodeFactory,
  placementGroupFactory,
  regionFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDeleteModal } from './PlacementGroupsDeleteModal';

import type { RenderResult } from '@testing-library/react';

const queryMocks = vi.hoisted(() => ({
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useDeletePlacementGroup: vi.fn().mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  }),
  useParams: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

vi.mock('src/queries/placementGroups', async () => {
  const actual = await vi.importActual('src/queries/placementGroups');
  return {
    ...actual,
    useDeletePlacementGroup: queryMocks.useDeletePlacementGroup,
  };
});

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
  };
});

const props = {
  onClose: vi.fn(),
  open: true,
};

describe('PlacementGroupsDeleteModal', () => {
  beforeAll(() => {
    queryMocks.useParams.mockReturnValue({
      id: '1',
    });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'us-east',
        }),
      ],
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({
          id: 1,
          label: 'test-linode',
          region: 'us-east',
        }),
      ],
    });
  });

  it('should render the right form elements', async () => {
    let renderResult: RenderResult;
    await act(async () => {
      renderResult = renderWithTheme(
        <PlacementGroupsDeleteModal
          {...props}
          selectedPlacementGroup={placementGroupFactory.build({
            affinity_type: 'anti_affinity:local',
            id: 1,
            label: 'PG-to-delete',
            members: [
              {
                is_compliant: true,
                linode_id: 1,
              },
            ],
            region: 'us-east',
          })}
          disableUnassignButton={false}
        />
      );
    });

    const { getByRole, getByTestId, getByText } = renderResult!;

    expect(
      getByRole('heading', {
        name: 'Delete Placement Group PG-to-delete (Anti-affinity)',
      })
    ).toBeInTheDocument();
    expect(
      getByText(
        'Linodes assigned to Placement Group PG-to-delete (Anti-affinity)'
      )
    ).toBeInTheDocument();
    expect(getByTestId('assigned-linodes')).toContainElement(
      getByText('test-linode')
    );
    expect(getByTestId('textfield-input')).toBeDisabled();
    expect(getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it("should be enabled when there's no assigned linodes", async () => {
    let renderResult: RenderResult;
    await act(async () => {
      renderResult = renderWithTheme(
        <PlacementGroupsDeleteModal
          {...props}
          selectedPlacementGroup={placementGroupFactory.build({
            affinity_type: 'anti_affinity:local',
            id: 1,
            label: 'PG-to-delete',
            members: [],
          })}
          disableUnassignButton={false}
        />
      );
    });

    const { getByRole, getByTestId } = renderResult!;

    const textField = getByTestId('textfield-input');
    const deleteButton = getByRole('button', { name: 'Delete' });

    expect(textField).toBeEnabled();
    expect(deleteButton).toBeDisabled();

    fireEvent.change(textField, { target: { value: 'PG-to-delete' } });

    expect(deleteButton).toBeEnabled();
    fireEvent.click(deleteButton);

    expect(queryMocks.useDeletePlacementGroup).toHaveBeenCalled();
  });
});
