import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsUnassignModal } from './PlacementGroupsUnassignModal';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/queries/linodes/linodes', async () => {
  const actual = await vi.importActual('src/queries/linodes/linodes');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

describe('PlacementGroupsUnassignModal', () => {
  it('should render and have the proper content and CTAs', () => {
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linodeFactory.build({
        id: 1,
        label: 'test-linode',
      }),
    });
    queryMocks.useParams.mockReturnValue({
      id: '1',
      linodeId: '1',
    });

    const { getByLabelText, getByRole } = renderWithTheme(
      <PlacementGroupsUnassignModal
        onClose={() => null}
        open
        selectedLinode={undefined}
      />
    );

    getByLabelText('Unassign test-linode');
    getByRole('button', { name: 'Unassign' });
    getByRole('button', { name: 'Cancel' });
  });
});
