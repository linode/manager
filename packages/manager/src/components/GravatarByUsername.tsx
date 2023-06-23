import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';
import * as React from 'react';
import UserIcon from 'src/assets/icons/account.svg';
import { useAccountUser } from 'src/queries/accountUsers';
import { getGravatarUrl } from 'src/utilities/gravatar';

interface Props {
  username: string | null;
  className?: string;
}

export const GravatarByUsername = (props: Props) => {
  const { username, className } = props;
  const { data: user } = useAccountUser(username ?? '');
  const url = user?.email ? getGravatarUrl(user.email) : undefined;

  return (
    <StyledAvatar
      className={classNames(className)}
      src={url}
      alt={`Avatar for user ${username}`}
    >
      <UserIcon className={classNames(className)} />
    </StyledAvatar>
  );
};

const StyledAvatar = styled(Avatar, {
  label: 'StyledGravatarByUsername',
})(() => ({
  height: 28,
  width: 28,
  borderRadius: '50%',
}));
