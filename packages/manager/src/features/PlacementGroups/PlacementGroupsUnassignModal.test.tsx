import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PlacementGroupsUnassignModal } from './PlacementGroupsUnassignModal';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
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
  it('should render and have the proper content and CTAs', async () => {
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

    const { getByLabelText, getByRole } = await renderWithThemeAndRouter(
      <PlacementGroupsUnassignModal
        isFetching={false}
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
