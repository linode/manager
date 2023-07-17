import FileCopy from '@mui/icons-material/FileCopy';
import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(() => ({
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
}));

export const StyledFileCopy = styled(FileCopy, {
  label: 'StyledFileCopy',
})(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.color.grey1,
    color: theme.color.white,
  },
  borderRadius: theme.shape.borderRadius,
  color: theme.color.grey1,
  cursor: 'pointer',
  height: 24,
  margin: 0,
  padding: 4,
  position: 'relative',
  transition: theme.transitions.create(['color', 'background-color']),
  width: 24,
}));

export const StyledPrefixWrapper = styled('div', {
  label: 'StyledPrefixWrapper',
})(({ theme }) => ({
  display: 'flex',
  marginLeft: theme.spacing(1.5),
  overflow: 'auto',
  whiteSpace: 'nowrap',
}));

export const StyledSlash = styled(Typography, {
  label: 'StyledSlash',
})(() => ({
  marginLeft: 4,
  marginRight: 4,
}));

export const StyledLink = styled(Typography, {
  label: 'StyledLink',
})(({ theme }) => ({
  '&:hover': {
    textDecoration: 'underline',
  },
  color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
}));

export const StyledCopied = styled(Typography, {
  label: 'StyledCopied',
})(({ theme }) => ({
  '@keyframes popUp': {
    from: {
      opacity: 0,
      top: -10,
      transform: 'scale(.1)',
    },
    to: {
      opacity: 1,
      top: -45,
      transform: 'scale(1)',
    },
  },
  animation: 'popUp 200ms ease-in-out forwards',
  backgroundColor: theme.color.white,
  boxShadow: `0 0 5px ${theme.color.boxShadow}`,
  color: theme.palette.text.primary,
  fontSize: '.85rem',
  left: -24,
  padding: '6px 8px',
  position: 'absolute',
  transition: 'opacity .5s ease-in-out',
}));
