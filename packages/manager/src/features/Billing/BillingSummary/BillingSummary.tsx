import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    height: '10em'
  }
}));

export const BillingSummary: React.FC<{}> = props => {
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      Brand new summary of amount due etc. will go here.
    </Paper>
  );
};

export default BillingSummary;
