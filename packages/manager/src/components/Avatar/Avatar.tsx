import { usePreferences, useProfile } from '@linode/queries';
import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import { default as _Avatar } from '@mui/material/Avatar';
import * as React from 'react';

import AkamaiWave from 'src/assets/logo/akamai-wave.svg';

import type { SxProps, Theme } from '@mui/material';

const DEFAULT_AVATAR_SIZE = 28;

export interface AvatarProps {
  /**
   * Optional background color to override the color set in user preferences
   * */
  color?: string;
  /**
   * Optional height
   * @default 28px
   * */
  height?: number;
  /**
   * Optional styles
   * */
  sx?: SxProps<Theme>;
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
    color,
    height = DEFAULT_AVATAR_SIZE,
    sx,
    username,
    width = DEFAULT_AVATAR_SIZE,
  } = props;

  const theme = useTheme();

  const { data: avatarColorPreference } = usePreferences(
    (preferences) => preferences?.avatarColor
  );
  const { data: profile } = useProfile();

  const _username = username ?? profile?.username ?? '';
  const isAkamai =
    _username === 'Akamai' || _username.startsWith('lke-service-account');

  const savedAvatarColor = isAkamai
    ? theme.palette.primary.dark
    : !avatarColorPreference
      ? theme.tokens.color.Neutrals[30]
      : avatarColorPreference;

  const avatarLetter = _username[0]?.toUpperCase() ?? '';

  return (
    <_Avatar
      alt={`Avatar for user ${username ?? profile?.email ?? ''}`}
      data-testid="avatar"
      sx={{
        '& svg': {
          height: width / 2,
          width: width / 2,
        },
        bgcolor: color ?? savedAvatarColor,
        height,
        width,
        ...sx,
      }}
    >
      {isAkamai ? (
        <AkamaiWave />
      ) : (
        <Typography
          data-testid="avatar-letter"
          sx={{
            color: theme.palette.getContrastText(color ?? savedAvatarColor),
            fontSize: width / 2,
          }}
        >
          {avatarLetter}
        </Typography>
      )}
    </_Avatar>
  );
};
