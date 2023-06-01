import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import classNames from 'classnames';
import UserIcon from 'src/assets/icons/account.svg';
import { getGravatarUrl } from 'src/utilities/gravatar';
import { styled } from '@mui/material/styles';

interface Props {
  height?: number;
  width?: number;
}

const StyledAvatar = styled(Avatar, {
  label: 'StyledAvatar',
})<Partial<Props>>(({ height, width }) => ({
  height: height || 28,
  width: width || 28,
  borderRadius: '50%',
}));

interface Props {
  email: string;
  className?: string;
}

export const GravatarByEmail = (props: Props) => {
  const { email, className } = props;
  const url = getGravatarUrl(email);

  return (
    <StyledAvatar
      className={classNames(className)}
      src={url}
      alt={`Avatar for user ${email}`}
    >
      <UserIcon />
    </StyledAvatar>
  );
};
