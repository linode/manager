import { Typography, useTheme } from '@mui/material';
import { default as _Avatar } from '@mui/material/Avatar';
import * as React from 'react';

import { usePreferences } from 'src/queries/profile/preferences';
import { useProfile } from 'src/queries/profile/profile';

import { getFontColor, hexToHSL } from './utils';

export const DEFAULT_AVATAR_SIZE = 28;

interface Props {
  className?: string;
  height?: number;
  width?: number;
}

export const Avatar = (props: Props) => {
  const {
    className,
    height = DEFAULT_AVATAR_SIZE,
    width = DEFAULT_AVATAR_SIZE,
  } = props;

  const theme = useTheme();

  const { data: preferences } = usePreferences();
  const { data: profile } = useProfile();

  const avatarLetter = profile?.username[0].toUpperCase() ?? '';
  const avatarHexColor = preferences?.avatarColor ?? theme.palette.primary.dark;
  const avatarHslColor = hexToHSL(avatarHexColor);
  const avatarLetterColor = avatarHslColor
    ? `theme.palette.common.${getFontColor(avatarHslColor)}`
    : theme.palette.common.white;

  return (
    <_Avatar
      alt={`Avatar for user ${profile?.email ?? profile?.username ?? ''}`}
      className={className}
      sx={{ bgcolor: avatarHexColor, height, width }}
    >
      <Typography sx={{ color: avatarLetterColor, fontSize: '3rem' }}>
        {avatarLetter}
      </Typography>
    </_Avatar>
  );
};
