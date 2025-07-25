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
  userPermissions: vi.fn(() => ({
    permissions: { update_account: false },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('LinodeEntityDetailFooter', () => {
  it('should disable "Add a tag" button if the user does not have update_account permission', async () => {
    const { getByRole } = renderWithTheme(
      <LinodeEntityDetailFooter {...props} />
    );

    const addTagBtn = getByRole('button', {
      name: 'Add a tag',
    });
    expect(addTagBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Add a tag" button if the user has update_account permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      permissions: { update_account: true },
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
