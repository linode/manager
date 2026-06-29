import { Color } from '@akamai/cds-tokens';
import { usePreferences, useProfile } from '@linode/queries';
import * as React from 'react';

const DEFAULT_AVATAR_SIZE = 28;

/**
 * Returns black or white depending on which has better contrast against the given hex color.
 */
const getContrastText = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.179 ? Color.Neutrals[90] : Color.Neutrals.White;
};

export interface AvatarProps {
  /**
   * Optional height
   * @default 28px
   * */
  height?: number;
  /**
   * Optional styles
   * */
  style?: React.CSSProperties;
  /**
   * Optional username to override the profile username; will display the first letter
   * */
  username?: string;
  /**
   * Optional width
   * @default 28px
   * */
  width?: number;
}

/**
 * The Avatar component displays the first letter of a username on a solid background color.
 * For system avatars associated with Akamai-generated events, an Akamai logo is displayed in place of a letter.
 */
export const Avatar = (props: AvatarProps) => {
  const {
    height = DEFAULT_AVATAR_SIZE,
    style,
    username,
    width = DEFAULT_AVATAR_SIZE,
  } = props;

  const { data: avatarColorPreference } = usePreferences(
    (preferences) => preferences?.avatarColor
  );
  const { data: profile } = useProfile();

  const _username = username ?? profile?.username ?? '';

  const savedAvatarColor =
    _username === profile?.username
      ? (avatarColorPreference ?? Color.Neutrals[30])
      : Color.Brand[90];

  const avatarLetter = _username[0]?.toUpperCase() ?? '';

  return (
    <div
      aria-label={`Avatar for user ${username ?? profile?.email ?? ''}`}
      data-testid="avatar"
      role="img"
      style={{
        alignItems: 'center',
        backgroundColor: savedAvatarColor,
        borderRadius: '50%',
        display: 'flex',
        flexShrink: 0,
        height,
        justifyContent: 'center',
        overflow: 'hidden',
        width,
        ...style,
      }}
    >
      <span
        data-testid="avatar-letter"
        style={{
          color: getContrastText(savedAvatarColor),
          fontSize: width / 2,
          lineHeight: 1,
        }}
      >
        {avatarLetter}
      </span>
    </div>
  );
};
