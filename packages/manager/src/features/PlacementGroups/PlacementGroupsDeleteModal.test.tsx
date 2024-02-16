import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { linodeFactory, placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDeleteModal } from './PlacementGroupsDeleteModal';

const queryMocks = vi.hoisted(() => ({
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useDeletePlacementGroup: vi.fn().mockReturnValue({
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
    useDeletePlacementGroup: queryMocks.useDeletePlacementGroup,
    usePlacementGroupQuery: queryMocks.usePlacementGroupQuery,
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
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [
        linodeFactory.build({
          id: 1,
          label: 'test-linode',
        }),
      ],
    });
  });

  it('should render the right form elements', () => {
    queryMocks.usePlacementGroupQuery.mockReturnValue({
      data: placementGroupFactory.build({
        affinity_type: 'anti_affinity',
        id: 1,
        label: 'PG-to-delete',
        linode_ids: [1],
      }),
    });

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <PlacementGroupsDeleteModal {...props} />
    );

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

  it("should be enabled when there's no assigned linodes", () => {
    queryMocks.usePlacementGroupQuery.mockReturnValue({
      data: placementGroupFactory.build({
        affinity_type: 'anti_affinity',
        id: 1,
        label: 'PG-to-delete',
        linode_ids: [],
      }),
    });
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <PlacementGroupsDeleteModal {...props} />
    );

    expect(getByText('No Linodes assigned to this Placement Group.'));

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
