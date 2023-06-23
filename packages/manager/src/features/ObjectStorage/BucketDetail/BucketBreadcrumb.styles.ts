import FileCopy from '@mui/icons-material/FileCopy';
import { styled } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(() => ({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
}));

export const StyledFileCopy = styled(FileCopy, {
  label: 'StyledFileCopy',
})(({ theme }) => ({
  cursor: 'pointer',
  transition: theme.transitions.create(['color', 'background-color']),
  color: theme.color.grey1,
  margin: 0,
  position: 'relative',
  width: 24,
  height: 24,
  padding: 4,
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.color.grey1,
    color: theme.color.white,
  },
}));

export const StyledPrefixWrapper = styled('div', {
  label: 'StyledPrefixWrapper',
})(({ theme }) => ({
  marginLeft: theme.spacing(1.5),
  display: 'flex',
  overflow: 'auto',
  whiteSpace: 'nowrap',
}));

export const StyledSlash = styled(Typography, {
  label: 'StyledSlash',
})(() => ({
  marginRight: 4,
  marginLeft: 4,
}));

export const StyledLink = styled(Typography, {
  label: 'StyledLink',
})(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

export const StyledCopied = styled(Typography, {
  label: 'StyledCopied',
})(({ theme }) => ({
  fontSize: '.85rem',
  left: -24,
  color: theme.palette.text.primary,
  padding: '6px 8px',
  backgroundColor: theme.color.white,
  position: 'absolute',
  boxShadow: `0 0 5px ${theme.color.boxShadow}`,
  transition: 'opacity .5s ease-in-out',
  animation: 'popUp 200ms ease-in-out forwards',
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
}));
