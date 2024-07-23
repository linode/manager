import Avatar from '@mui/material/Avatar';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import { getGravatarUrl } from 'src/utilities/gravatar';

export const DEFAULT_AVATAR_SIZE = 28;

interface Props {
  className?: string;
  email: string;
  height?: number;
  width?: number;
}

export const GravatarByEmail = (props: Props) => {
  const {
    className,
    email,
    height = DEFAULT_AVATAR_SIZE,
    width = DEFAULT_AVATAR_SIZE,
  } = props;

  const url = getGravatarUrl(email);

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
