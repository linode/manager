import * as React from 'react';

import { createProfile } from '../../factories';
import { renderWithProviders } from '../../utilities/testHelpers';
import { Avatar } from './Avatar';

import type { AvatarProps } from './Avatar';

const mockProps: AvatarProps = {};

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
    useProfile: queryMocks.useProfile,
  };
});

describe('Avatar', () => {
  it('should render the first letter of a username from /profile with default background color', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'my-user' }),
    });
    const { getByTestId } = renderWithProviders(<Avatar {...mockProps} />);
    const avatar = getByTestId('avatar');
    const avatarStyles = getComputedStyle(avatar);

    expect(getByTestId('avatar-letter')).toHaveTextContent('M');
    expect(avatarStyles.backgroundColor).toBe('rgb(214, 214, 221)');
  });

  it('should render brand color for a different user', () => {
    queryMocks.useProfile.mockReturnValue({
      data: createProfile({ username: 'my-user' }),
    });

    const { getByTestId } = renderWithProviders(
      <Avatar {...mockProps} username="other-user" />
    );
    const avatar = getByTestId('avatar');
    const avatarStyles = getComputedStyle(avatar);

    expect(avatarStyles.backgroundColor).toBe('rgb(1, 116, 188)');
  });

  it('should render the first letter of username from props', async () => {
    const { getByTestId } = renderWithProviders(
      <Avatar {...mockProps} username="test" />
    );

    expect(getByTestId('avatar-letter')).toHaveTextContent('T');
  });

  it('should render a letter for Akamai system user', async () => {
    const { getByTestId } = renderWithProviders(
      <Avatar {...mockProps} username="Akamai" />
    );
    expect(getByTestId('avatar-letter')).toBeVisible();
  });

  it('should render a letter for lke-service-account system user', async () => {
    const { getByTestId } = renderWithProviders(
      <Avatar {...mockProps} username="lke-service-account-123" />
    );
    expect(getByTestId('avatar-letter')).toBeVisible();
  });
});
