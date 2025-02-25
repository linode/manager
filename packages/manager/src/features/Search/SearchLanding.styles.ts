import { keyframes } from '@emotion/react';
import { H1Header, Stack } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

import Error from 'src/assets/icons/error.svg';

export const StyledStack = styled(Stack, {
  label: 'StyledStack',
})(({ theme }) => ({
  alignItems: 'center',
  padding: `${theme.spacing(10)} ${theme.spacing(4)}`,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: `${theme.spacing(10)} ${theme.spacing(4)}`,
}));

const blink = keyframes`
  0%, 50%, 100% {
    transform: scaleY(0.1);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
   100% {
   transform: rotate(360deg);
  }
`;

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25%, 75% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
`;

export const StyledError = styled(Error, {
  label: 'StyledError',
})(({ theme }) => ({
  '& path:nth-of-type(4)': {
    animation: `${blink} 1s`,
    transformBox: 'fill-box',
    transformOrigin: 'center',
  },
  '& path:nth-of-type(5)': {
    animation: `${rotate} 3s`,
    transformBox: 'fill-box',
    transformOrigin: 'center',
  },
  animation: `${shake} 0.5s`,
  color: theme.palette.text.primary,
  height: 60,
  marginBottom: theme.spacing(4),
  width: 60,
}));

export const StyledH1Header = styled(H1Header, {
  label: 'StyledH1Header',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
  },
}));

export const StyledRootGrid = styled(Grid, {
  label: 'StyledRootGrid',
})({
  padding: 0,
  width: 'calc(100% + 16px)',
});
