import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import ProxyUserIcon from 'src/assets/icons/parent-child.svg';

interface Props {
  height?: number;
  width?: number;
}

export const AvatarForProxy = ({ height = 34, width = 34 }: Props) => {
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
