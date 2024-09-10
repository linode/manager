import Avatar from '@mui/material/Avatar';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import { getGravatarUrl } from 'src/utilities/gravatar';

import { Box } from './Box';

export const DEFAULT_AVATAR_SIZE = 28;

export interface GravatarByEmailProps {
  className?: string;
  email: string;
  height?: number;
  width?: number;
}

export const GravatarByEmail = (props: GravatarByEmailProps) => {
  const {
    className,
    email,
    height = DEFAULT_AVATAR_SIZE,
    width = DEFAULT_AVATAR_SIZE,
  } = props;

  const url = getGravatarUrl(email);

  // Render placeholder instead of flashing default user icon briefly
  if (!url) {
    return (
      <Box
        sx={{
          height,
          width,
        }}
      />
    );
  }

  return (
    <Avatar
      alt={`Avatar for user ${email}`}
      className={className}
      src={url}
      sx={{ height, width }}
    >
      <UserIcon />
    </Avatar>
  );
};
