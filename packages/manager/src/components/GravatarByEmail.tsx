import * as React from 'react';
import classNames from 'classnames';
import UserIcon from 'src/assets/icons/account.svg';
import { makeStyles } from '@mui/styles';
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
  email: string;
  className?: string;
}

export const GravatarByEmail = (props: Props) => {
  const { email, className } = props;
  const classes = useStyles();

  const url = getGravatarUrl(email);

  return (
    <Avatar
      className={classNames(classes.avatar, className)}
      src={url}
      alt={`Avatar for user ${email}`}
    >
      <UserIcon className={classNames(classes.avatar, className)} />
    </Avatar>
  );
};
