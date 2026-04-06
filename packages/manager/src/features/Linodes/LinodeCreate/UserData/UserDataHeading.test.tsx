import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDataHeading } from './UserDataHeading';

const queryMocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
  };
});

describe('UserDataHeading', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      linodeId: '123',
    });
  });

  it('should display a warning in the header for cloning', async () => {
    const { getByText } = renderWithTheme(<UserDataHeading />, {
      initialRoute: '/linodes/create/clone',
    });

    expect(
      getByText(
        'Existing user data is not cloned. You may add new user data now.'
      )
    ).toBeVisible();
  });

  it('should display a warning in the header for creating from a Linode backup', async () => {
    const { getByText } = renderWithTheme(<UserDataHeading />, {
      initialRoute: '/linodes/create/backups',
    });

    expect(
      getByText(
        'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.'
      )
    ).toBeVisible();
  });
});
