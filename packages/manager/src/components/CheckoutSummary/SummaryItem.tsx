import React from 'react';
import { makeStyles, Theme } from '../core/styles';
import Typography from '../core/Typography';
import Grid from '../Grid';
import { SummaryItem as Props } from './CheckoutSummary';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
}));

export const SummaryItem = ({ title, details }: Props) => {
  const classes = useStyles();

  return (
    <Grid item className={classes.item}>
      {title ? (
        <>
          <Typography style={{ fontWeight: 'bold' }} component="span">
            {title}
          </Typography>{' '}
        </>
      ) : null}
      <Typography component="span" data-qa-details={details}>
        {details}
      </Typography>
    </Grid>
  );
};
