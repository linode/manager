import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import { useAccountUser } from 'src/queries/accountUsers';
import { getGravatarUrl } from 'src/utilities/gravatar';

interface Props {
  className?: string;
  username: null | string;
}

export const GravatarByUsername = (props: Props) => {
  const { className, username } = props;
  const { data: user } = useAccountUser(username ?? '');
  const url = user?.email ? getGravatarUrl(user.email) : undefined;

  return (
    <StyledAvatar
      alt={`Avatar for user ${username}`}
      className={className}
      src={url}
    >
      <UserIcon className={className} />
    </StyledAvatar>
  );
};

const StyledAvatar = styled(Avatar, {
  label: 'StyledGravatarByUsername',
})(() => ({
  borderRadius: '50%',
  height: 28,
  width: 28,
}));
