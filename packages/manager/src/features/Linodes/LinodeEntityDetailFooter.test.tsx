import { profileFactory } from '@linode/utilities';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeEntityDetailFooter } from './LinodeEntityDetailFooter';

const props = {
  linodeCreated: '2018-11-01T00:00:00',
  linodeId: 1,
  linodeLabel: 'test-linode',
  linodePlan: 'Linode 4GB',
  linodeRegionDisplay: 'us-east',
  linodeTags: ['test', 'linode'],
};

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('LinodeEntityDetailFooter', () => {
  it('should disable "Add a tag" button if the user is restricted', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ restricted: true }),
    });

    const { getByRole } = renderWithTheme(
      <LinodeEntityDetailFooter {...props} />
    );

    const addTagBtn = getByRole('button', {
      name: 'Add a tag',
    });
    expect(addTagBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add a tag" button if the user is not restricted', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ restricted: false }),
    });

    const { getByRole } = renderWithTheme(
      <LinodeEntityDetailFooter {...props} />
    );

    const addTagBtn = getByRole('button', {
      name: 'Add a tag',
    });
    expect(addTagBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
