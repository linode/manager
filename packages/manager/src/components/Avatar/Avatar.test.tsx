import * as React from 'react';

import { profileFactory } from 'src/factories/profile';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Avatar } from './Avatar';

import type { AvatarProps } from './Avatar';

const mockProps: AvatarProps = {};

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/profile', async () => {
  const actual = await vi.importActual('src/queries/profile/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('Avatar', () => {
  it('should render the first letter of a username from /profile with default background color', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'my-user' }),
    });
    const { getByTestId } = renderWithTheme(<Avatar {...mockProps} />);
    const avatar = getByTestId('avatar');
    const avatarStyles = getComputedStyle(avatar);

    expect(getByTestId('avatar-letter')).toHaveTextContent('M');
    expect(avatarStyles.backgroundColor).toBe('rgb(214, 214, 221)');
  });

  it('should render a background color from props', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'my-user' }),
    });

    const { getByTestId } = renderWithTheme(
      <Avatar {...mockProps} color="#000000" />
    );
    const avatar = getByTestId('avatar');
    const avatarText = getByTestId('avatar-letter');
    const avatarStyles = getComputedStyle(avatar);
    const avatarTextStyles = getComputedStyle(avatarText);

    // Confirm background color contrasts with text color.
    expect(avatarStyles.backgroundColor).toBe('rgb(0, 0, 0)'); // black
    expect(avatarTextStyles.color).toBe('rgb(255, 255, 255)'); // white
  });

  it('should render the first letter of username from props', async () => {
    const { getByTestId } = renderWithTheme(
      <Avatar {...mockProps} username="test" />
    );

    expect(getByTestId('avatar-letter')).toHaveTextContent('T');
  });

  it('should render an svg instead of first letter for system users', async () => {
    const systemUsernames = ['Akamai', 'lke-service-account-123'];

    systemUsernames.forEach((username, i) => {
      const { getAllByRole, queryByTestId } = renderWithTheme(
        <Avatar {...mockProps} username={username} />
      );
      expect(getAllByRole('img')[i]).toBeVisible();
      expect(queryByTestId('avatar-letter')).toBe(null);
    });
  });
});
