import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

export const StyledInstructionGrid = styled(Grid, {
  label: 'StyledInstructionGrid',
})(({ theme }) => ({
  boxSizing: 'border-box',
  columnGap: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  margin: '0',
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
}));

export const StyledContainerGrid = styled(Grid, {
  label: 'StyledContainerGrid',
})(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: theme.color.grey5,
  borderRadius: theme.shape.borderRadius,
  boxSizing: 'border-box',
  display: 'flex',
  margin: `${theme.spacing(1)} 0`,
  maxWidth: '100%',
  wrap: 'noWrap',
}));
