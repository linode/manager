import React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { UserDataHeading } from './UserDataHeading';

const queryMocks = vi.hoisted(() => ({
  useSearch: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('UserDataHeading', () => {
  beforeEach(() => {
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({
      linodeId: '123',
    });
  });

  it('should display a warning in the header for cloning', async () => {
    queryMocks.useSearch.mockReturnValue({
      type: 'Clone Linode',
    });

    const { getByText } = await renderWithThemeAndRouter(<UserDataHeading />, {
      initialRoute: '/linodes/create',
    });

    expect(
      getByText(
        'Existing user data is not cloned. You may add new user data now.'
      )
    ).toBeVisible();
  });

  it('should display a warning in the header for creating from a Linode backup', async () => {
    queryMocks.useSearch.mockReturnValue({
      type: 'Backups',
    });

    const { getByText } = await renderWithThemeAndRouter(<UserDataHeading />, {
      initialRoute: '/linodes/create',
    });

    expect(
      getByText(
        'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.'
      )
    ).toBeVisible();
  });
});
