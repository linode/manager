import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { PlacementGroupsUnassignModal } from './PlacementGroupsUnassignModal';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
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
  beforeAll(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it('should render and have the proper content and CTAs', async () => {
    const date = new Date(2024, 9, 1);

    vi.useFakeTimers();
    vi.setSystemTime(date);
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
