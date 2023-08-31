import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Unstable_Grid2';

export const sxItem = {
  boxSizing: 'border-box',
  margin: '0',
};

export const sxContainer = {
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
};

export const StyledInstructionGrid = styled(Grid, {
  label: 'StyledInstructionGrid',
})(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    '&:not(:first-of-type)': {
      '&:before': {
        content: "'|'",
        left: `calc(-${theme.spacing(1)} + 2px)`,
        position: 'absolute',
        top: `calc(${theme.spacing(1)} - 3px)`,
      },
      marginLeft: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      position: 'relative',
    },
    width: 'auto',
  },
  width: '100%',
  boxSizing: 'border-box',
  margin: '0',
}));

export const StyledContainerGrid = styled(Grid, {
  label: 'StyledContainerGrid',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.color.grey5,
  borderRadius: theme.shape.borderRadius,
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  margin: `${theme.spacing(1)} 0`,
  maxWidth: '100%',
  wrap: 'noWrap',
}));
