import { profileFactory } from '@linode/utilities';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Avatar } from './Avatar';

import type { AvatarProps } from './Avatar';

const mockProps: AvatarProps = {};

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

  it.each(['Akamai', 'lke-service-account-123'])(
    'should render an svg instead of first letter for system and service account users',
    (username) => {
      const { getByTestId, queryByTestId } = renderWithTheme(
        <Avatar {...mockProps} username={username} />
      );
      expect(getByTestId('akamai-wave-icon')).toBeVisible();
      expect(queryByTestId('avatar-letter')).toBe(null);
    }
  );
});
