import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { TableCell } from 'src/components/TableCell';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    margin: 0,
    marginTop: theme.spacing(2),
    width: '100%',
    '& .MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .domain-btn': {
      [theme.breakpoints.down('lg')]: {
        marginRight: theme.spacing(),
      },
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  })
);

export const StyledTableCell = styled(TableCell, { label: 'StyledTabelCell' })(
  ({ theme }) => ({
    whiteSpace: 'nowrap' as const,
    width: 'auto',
    '& .data': {
      maxWidth: 300,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      [theme.breakpoints.up('md')]: {
        maxWidth: 750,
      },
    },
    '&:last-of-type': {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  })
);

export const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));
