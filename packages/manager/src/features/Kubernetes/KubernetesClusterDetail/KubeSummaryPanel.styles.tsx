// This component was built asuming an unmodified MUI <Table />
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { Box } from 'src/components/Box';

export const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    minHeight: theme.spacing(3),
  },
  [theme.breakpoints.up('lg')]: {
    minHeight: theme.spacing(5),
    padding: `0px 10px`,
  },
}));

export const StyledActionRowGrid = styled(Grid, {
  label: 'StyledActionRowGrid',
})({
  '& button': {
    alignItems: 'flex-start',
  },
  alignItems: 'flex-end',
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: '8px 0px',
});

export const StyledTagGrid = styled(Grid, { label: 'StyledTagGrid' })(
  ({ theme }) => ({
    // Tags Panel wrapper
    '& > div:last-child': {
      marginBottom: 0,
      marginTop: 2,
      width: '100%',
    },
    '&.MuiGrid-item': {
      paddingBottom: 0,
    },
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
    },
    [theme.breakpoints.up('lg')]: {
      '& .MuiChip-root': {
        marginLeft: 4,
        marginRight: 0,
      },
      // Add a Tag button
      '& > div:first-of-type': {
        justifyContent: 'flex-end',
        marginTop: theme.spacing(4),
      },
      // Tags Panel wrapper
      '& > div:last-child': {
        display: 'flex',
        justifyContent: 'flex-end',
      },
    },
    width: '100%',
  })
);
