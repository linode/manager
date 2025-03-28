import { CircleProgress, Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

import SSHKeyIcon from 'src/assets/icons/ssh-key.svg';

export const StyledCopyToClipboardGrid = styled(Grid, {
  label: 'StyledCopyToClipboardGrid',
})(({ theme }) => ({
  '& > button': {
    marginTop: theme.spacing(1),
    minWidth: 190,
  },
  alignItems: 'flex-start',
  display: 'flex',
  justifyContent: 'flex-start',
  [theme.breakpoints.up('sm')]: {
    justifyContent: 'flex-end',
  },
}));

export const StyledErrorStatePaper = styled(Paper, {
  label: 'StyledErrorStatePaper',
})(({ theme }) => ({
  '& > div': {
    padding: 0,
  },
  padding: `calc(${theme.spacing(2)} - 1px)`,
}));

export const StyledSSHKeyIcon = styled(SSHKeyIcon, {
  label: 'StyledSSHKeyIcon',
})(({ theme }) => ({
  marginBottom: `calc(${theme.spacing(1)} - 2px)`,
  marginRight: theme.spacing(1),
  stroke: theme.color.offBlack,
}));

export const StyledLoadingStatePaper = styled(Paper, {
  label: 'StyledLoadingStatePaper',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '112px',
  padding: theme.spacing(2.5),
}));

export const StyledRootPaper = styled(Paper, {
  label: 'StyledRootPaper',
})(({ theme }) => ({
  minHeight: '112px',
  padding: theme.spacing(2.5),
}));

export const StyledCircleProgress = styled(CircleProgress, {
  label: 'StyledCircleProgress',
})(({ theme }) => ({
  padding: theme.spacing(5),
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  // NOTE A:
  // I'm not confident about this CSS, but it works on recent versions
  // of Chrome, Firefox, Safari, and Edge. If we run into inconsistencies
  // in other environments, consider removing it and using the fallback
  '&:hover': {
    WebkitLineClamp: 'unset',
    transition: 'all 1s ease-in',
  },
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  color: theme.color.grey1,
  // provided in the component below.
  display: '-webkit-box',
  fontFamily: '"Ubuntu Mono", monospace, sans-serif',
  fontSize: '0.9rem',
  overflow: 'hidden',
  [theme.breakpoints.up('lg')]: {
    paddingRight: theme.spacing(6),
  },
  [theme.breakpoints.up('md')]: {
    padding: `0 ${theme.spacing(4)} 0 ${theme.spacing(1)}`,
  },
  [theme.breakpoints.up('xl')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  transition: 'all 1s ease-in',
  wordBreak: 'break-all',
}));

export const StyledSSHKeyContainerGrid = styled(Grid, {
  label: 'StyledSSHKeyContainerGrid',
})({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
});
