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
}));

interface Props {
  className?: string;
  email: string;
}

export const GravatarByEmail = (props: Props) => {
  const { className, email, height, width } = props;
  const url = getGravatarUrl(email);

  return (
    <StyledAvatar
      alt={`Avatar for user ${email}`}
      className={classNames(className)}
      src={url}
      sx={{ height, width }}
    >
      <UserIcon />
    </StyledAvatar>
  );
};
