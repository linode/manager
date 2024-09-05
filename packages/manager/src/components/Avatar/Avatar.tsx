import { Typography, useTheme } from '@mui/material';
import { default as _Avatar } from '@mui/material/Avatar';
import * as React from 'react';

import AkamaiWave from 'src/assets/logo/akamai-wave.svg';
import { usePreferences } from 'src/queries/profile/preferences';
import { useProfile } from 'src/queries/profile/profile';

import type { SxProps } from '@mui/material';

export const DEFAULT_AVATAR_SIZE = 28;

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
  sx?: SxProps;
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

  const { data: preferences } = usePreferences();
  const { data: profile } = useProfile();

  const _username = username ?? profile?.username ?? '';
  const isAkamai = /^Linode$|^lke-service-account*/.test(_username);

  const savedAvatarColor =
    preferences?.avatarColor ?? theme.palette.primary.dark;
  const avatarLetter = _username[0]?.toUpperCase() ?? '';

  return (
    <_Avatar
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
      alt={`Avatar for user ${username ?? profile?.email ?? ''}`}
      data-testid="avatar"
    >
      {isAkamai ? (
        <AkamaiWave />
      ) : (
        <Typography
          sx={{
            color: theme.palette.getContrastText(color ?? savedAvatarColor),
            fontSize: width / 2,
          }}
          data-testid="avatar-letter"
        >
          {avatarLetter}
        </Typography>
      )}
    </_Avatar>
  );
};
