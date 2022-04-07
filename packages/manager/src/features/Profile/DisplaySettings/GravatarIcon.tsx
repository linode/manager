import classNames from 'classnames';
import * as React from 'react';
import UserIcon from 'src/assets/icons/account.svg';
import { makeStyles } from 'src/components/core/styles';
import usePagination from 'src/hooks/usePagination';
import { useAccountUsers } from 'src/queries/accountUsers';

const useStyles = makeStyles(() => ({
  avatar: {
    height: 28,
    width: 28,
    borderRadius: '50%',
  },
}));

interface Props {
  username: string | null;
  className?: string;
}

export const GravatarIcon: React.FC<Props> = (props) => {
  const { username, className } = props;
  const pagination = usePagination(1, 'account-users');
  const {
    data: users,
    isLoading: gravatarLoading,
    error: gravatarError,
  } = useAccountUsers(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    true
  );
  const classes = useStyles();

  const gravatarURL = users?.data.find((user) => user.username === username)
    ?.gravatarUrl;

  const noGravatar =
    gravatarLoading ||
    gravatarError ||
    !gravatarURL ||
    gravatarURL === 'not found';

  if (noGravatar) {
    return (
      <UserIcon
        className={classNames([classes.avatar], className)}
        style={{ color: '#c9c7c7' }}
        alt={`Avatar for user ${username}`}
      />
    );
  }

  return (
    <img
      className={classNames([classes.avatar], className)}
      src={gravatarURL}
      alt={`Avatar for user ${username}`}
    />
  );
};

export default GravatarIcon;
