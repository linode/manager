import classNames from 'classnames';
import * as React from 'react';
import UserIcon from 'src/assets/icons/account.svg';
import { makeStyles } from 'src/components/core/styles';
import { useAccountGravatar } from 'src/queries/account';
import { useProfile } from 'src/queries/profile';

const useStyles = makeStyles(() => ({
  avatar: {
    height: 28,
    width: 28,
    borderRadius: '50%',
  },
}));

interface Props {
  className?: string;
}

export const GravatarIcon: React.FC<Props> = (props) => {
  const { className } = props;
  const { data: profile } = useProfile();
  const classes = useStyles();

  const {
    data: gravatarURL,
    error: gravatarError,
    isLoading: gravatarLoading,
  } = useAccountGravatar(profile?.email ?? '');

  const noGravatar =
    gravatarLoading || gravatarError || gravatarURL === 'not found';

  if (noGravatar) {
    return (
      <UserIcon
        className={classNames([classes.avatar], className)}
        style={{ color: '#c9c7c7' }}
      />
    );
  }

  return (
    <img
      className={classNames([classes.avatar], className)}
      src={gravatarURL}
      alt="Gravatar"
    />
  );
};

export default GravatarIcon;
