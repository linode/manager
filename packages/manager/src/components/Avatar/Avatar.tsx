import { Typography, useTheme } from '@mui/material';
import { default as _Avatar } from '@mui/material/Avatar';
import * as React from 'react';

import AkamaiWave from 'src/assets/logo/akamai-wave.svg';
import { usePreferences } from 'src/queries/profile/preferences';
import { useProfile } from 'src/queries/profile/profile';

import type { SxProps } from '@mui/material';

export const DEFAULT_AVATAR_SIZE = 28;

interface Props {
  className?: string;
  color?: string;
  height?: number;
  sx?: SxProps;
  username?: string;
  width?: number;
}

export const Avatar = (props: Props) => {
  const {
    className,
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

  const avatarColor = preferences?.avatarColor ?? theme.palette.primary.dark;
  const avatarLetter = _username[0]?.toUpperCase() ?? '';

  return (
    <_Avatar
      sx={{
        '& svg': {
          height: '2vh',
          width: '2vw',
        },
        bgcolor: color ?? avatarColor,
        height,
        width,
        ...sx,
      }}
      alt={`Avatar for user ${username ?? profile?.email ?? ''}`}
      className={className}
    >
      {isAkamai ? (
        <AkamaiWave />
      ) : (
        <Typography
          sx={{
            color: theme.palette.getContrastText(color ?? avatarColor),
            fontSize: width / 2,
          }}
        >
          {avatarLetter}
        </Typography>
      )}
    </_Avatar>
  );
};
