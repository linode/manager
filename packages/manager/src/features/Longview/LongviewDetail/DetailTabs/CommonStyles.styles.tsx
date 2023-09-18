import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import TimeRangeSelect from '../../shared/TimeRangeSelect';

export const StyledTimeRangeSelect = styled(TimeRangeSelect, {
  label: 'StyledTimeRangeSelect',
})({
  width: 250,
});

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));

export const StyledItemGrid = styled(Grid, { label: 'StyledItemGrid' })({
  boxSizing: 'border-box',
  margin: '0',
});

export const StyledSmallGraphGrid = styled(Grid, {
  label: 'StyledSmallGraphGrid',
})(({ theme }) => ({
  boxSizing: 'border-box',
  margin: '0',
  marginTop: `calc(${theme.spacing(6)} + 3px)`,
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(3.25),
  },
}));

export const StyledRootPaper = styled(Paper, { label: 'StyledRootPaper' })(
  ({ theme }) => ({
    padding: `${theme.spacing(3.25)} ${theme.spacing(3.25)} ${theme.spacing(
      5.5
    )}`,
  })
);
