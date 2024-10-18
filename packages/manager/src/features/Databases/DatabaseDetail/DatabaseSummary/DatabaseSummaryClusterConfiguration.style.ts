import { styled } from '@mui/material/styles';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

export const StyledGridContainer = styled(Grid2, {
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
  background:
    theme.palette.mode === 'dark'
      ? theme.bg.tableHeader
      : theme.palette.grey[200],
  color: theme.palette.mode === 'dark' ? theme.color.grey6 : 'inherit',
  fontFamily: theme.font.bold,
  height: '100%',
  padding: '4px 15px',
}));

export const StyledValueBox = styled(Box, {
  label: 'StyledValueBox',
})(({ theme }) => ({
  '& > button': {
    marginTop: '-5px',
  },
  '& > div': {
    alignSelf: 'flex-start',
    verticalAlign: 'sub',
  },
  '& button.MuiButtonBase-root': {
    marginTop: '0',
  },
  '& button.copy-tooltip': {
    marginTop: '-3px',
  },
  color: theme.palette.mode === 'dark' ? theme.color.grey8 : theme.color.black,
  display: 'flex',
  padding: '3px 5px',
}));
