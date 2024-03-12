import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import UserIcon from 'src/assets/icons/account.svg';
import ProxyUserIcon from 'src/assets/icons/parent-child.svg';
import { Box } from 'src/components/Box';
import { getGravatarUrl } from 'src/utilities/gravatar';

interface Props {
  className?: string;
  email: string;
  height?: number;
  width?: number;
}

export const GravatarByEmail = (props: Props) => {
  const { className, email, height, width } = props;
  const url = getGravatarUrl(email);

  return (
    <StyledAvatar
      alt={`Avatar for user ${email}`}
      className={className}
      src={url}
      sx={{ height, width }}
    >
      <UserIcon />
    </StyledAvatar>
  );
};

const StyledAvatar = styled(Avatar, {
  label: 'StyledAvatar',
})<Partial<Props>>(({ height, width }) => ({
  height: height || 28,
  width: width || 28,
}));

type ProxyUserGravatarProps = Omit<Props, 'email'>;

export const ProxyUserGravatar = ({
  height = 34,
  width = 34,
}: ProxyUserGravatarProps) => {
  return (
    <Box
      sx={(theme) => ({
        background: `linear-gradient(60deg, ${theme.color.blue}, ${theme.color.teal} )`,
        backgroundSize: '300% 300%',
        borderRadius: '50%',
        height,
        padding: '3px',
        width,
      })}
    >
      <Box
        sx={(theme) => ({
          background: theme.color.white,
          borderRadius: '50%',
          color: theme.palette.text.primary,
          height: `calc(${height}px - 6px)`,
          overflow: 'hidden',
          position: 'relative',
          width: `calc(${width}px - 6px)`,
        })}
      >
        <StyledProxyUserIcon />
      </Box>
    </Box>
  );
};

const StyledProxyUserIcon = styled(ProxyUserIcon, {
  label: 'styledProxyUserIcon',
})(() => ({
  bottom: 0,
  left: 0,
  position: 'absolute',
}));
