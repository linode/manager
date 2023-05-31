import Typography from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';
import { styled } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  disabled: {
    '& *': {
      color: theme.color.disabledText,
    },
  },
}));

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  justifyContent: 'left',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

export const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  lineHeight: '20px',
  marginTop: theme.spacing(),
  marginBottom: theme.spacing(),
  maxWidth: 960,
}));
