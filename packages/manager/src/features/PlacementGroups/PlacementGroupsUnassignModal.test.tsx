import { linodeFactory } from '@linode/utilities';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsUnassignModal } from './PlacementGroupsUnassignModal';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
  };
});

describe('PlacementGroupsUnassignModal', () => {
  it('should render and have the proper content and CTAs', () => {
    const linode = linodeFactory.build({
      id: 1,
      label: 'test-linode',
    });
    queryMocks.useParams.mockReturnValue({
      id: '1',
      linodeId: '1',
    });

    const { getByLabelText, getByRole } = renderWithTheme(
      <PlacementGroupsUnassignModal
        isFetching={false}
        onClose={() => null}
        open
        selectedLinode={linode}
        selectedLinodeError={null}
      />
    );

    getByLabelText('Unassign test-linode');
    getByRole('button', { name: 'Unassign' });
    getByRole('button', { name: 'Cancel' });
  });
});
