import * as React from 'react';
import classNames from 'classnames';
import UserIcon from 'src/assets/icons/account.svg';
import { makeStyles } from '@mui/styles';
import { useAccountUser } from 'src/queries/accountUsers';
import { getGravatarUrl } from 'src/utilities/gravatar';
import Avatar from '@mui/material/Avatar';

const useStyles = makeStyles({
  avatar: {
    height: 28,
    width: 28,
    borderRadius: '50%',
  },
});

interface Props {
  username: string | null;
  className?: string;
}

export const GravatarByUsername = (props: Props) => {
  const { username, className } = props;
  const classes = useStyles();

  const { data: user } = useAccountUser(username ?? '');

  const url = user?.email ? getGravatarUrl(user.email) : undefined;

  return (
    <Avatar
      className={classNames(classes.avatar, className)}
      src={url}
      alt={`Avatar for user ${username}`}
    >
      <UserIcon className={classNames(classes.avatar, className)} />
    </Avatar>
  );
};
