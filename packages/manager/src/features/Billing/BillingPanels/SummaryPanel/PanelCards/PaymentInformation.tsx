import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import styled from 'src/containers/SummaryPanels.styles';
import CreditCard from './CreditCard';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  container: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  billingGroup: {
    marginBottom: theme.spacing(3)
  },
  edit: {
    fontSize: '.875rem',
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
    minWidth: 'auto',
    padding: 0
  }
}));

interface Props {
  balanceUninvoiced: number;
  balance: number;
  expiry: string;
  lastFour: string;
  promoCredit?: string;
}

type CombinedProps = Props;

const PaymentInformation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { lastFour, expiry } = props;

  return (
    <Paper className={classes.summarySection} data-qa-billing-summary>
      <div className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          Payment Method
        </Typography>

        <Button className={classes.edit}>Edit</Button>
      </div>

      <div className={classes.billingGroup}>
        <CreditCard lastFour={lastFour} expiry={expiry} />
      </div>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(PaymentInformation);
