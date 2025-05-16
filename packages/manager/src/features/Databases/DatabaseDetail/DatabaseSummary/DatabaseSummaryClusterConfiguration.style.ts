import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

export const StyledGridContainer = styled(Grid, {
  label: 'StyledGridContainer',
})(({ theme }) => ({
  '&>*:nth-of-type(even)': {
    boxShadow: `inset 0px -1px 0px 0 ${
      theme.palette.mode === 'dark'
        ? theme.color.white
        : theme.palette.grey[200]
    }`,
  },
  '&>*:nth-of-type(odd)': {
    boxShadow: `inset 0px -1px 0px 0 ${theme.color.white}`,
    marginBottom: '1px',
  },
  boxShadow: `inset 0 -1px 0 0 ${
    theme.palette.mode === 'dark' ? theme.color.white : theme.palette.grey[200]
  }, inset 0 1px 0 0 ${
    theme.palette.mode === 'dark' ? theme.color.white : theme.palette.grey[200]
  }, inset -1px 0 0 ${
    theme.palette.mode === 'dark' ? theme.color.white : theme.palette.grey[200]
  }`,
}));

export const StyledLabelTypography = styled(Typography, {
  label: 'StyledLabelTypography',
})(({ theme }) => ({
  background: theme.tokens.alias.Background.Neutral,
  color: theme.palette.mode === 'dark' ? theme.color.grey6 : 'inherit',
  font: theme.font.bold,
  height: '100%',
  padding: `${theme.spacing(0.5)} 15px`,
}));

export const StyledValueGrid = styled(Grid, {
  label: 'StyledValueGrid',
})(({ theme }) => ({
  alignItems: 'center',
  color: theme.palette.mode === 'dark' ? theme.color.grey8 : theme.color.black,
  display: 'flex',
  padding: `0 ${theme.spacing()}`,
}));
