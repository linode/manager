import { styled } from '@mui/material/styles';

import { Grid } from 'src/components/Grid';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { TimeRangeSelect } from '../../shared/TimeRangeSelect';

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

export const StyledSmallGraphGrid = styled(Grid, {
  label: 'StyledSmallGraphGrid',
})(({ theme }) => ({
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
