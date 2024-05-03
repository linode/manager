import Avatar from '@mui/material/Avatar';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import { useAccountUser } from 'src/queries/account/users';
import { getGravatarUrl } from 'src/utilities/gravatar';

import { DEFAULT_AVATAR_SIZE } from './GravatarByEmail';

interface Props {
  className?: string;
  username: null | string;
}

export const GravatarByUsername = (props: Props) => {
  const { className, username } = props;
  const { data: user } = useAccountUser(username ?? '');
  const url = user?.email ? getGravatarUrl(user.email) : undefined;

  return (
    <Avatar
      alt={`Avatar for user ${username}`}
      className={className}
      src={url}
      sx={{ height: DEFAULT_AVATAR_SIZE, width: DEFAULT_AVATAR_SIZE }}
    >
      <UserIcon className={className} />
    </Avatar>
  );
};
