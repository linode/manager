import * as classNames from 'classnames';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

import styled from 'src/containers/SummaryPanels.styles';

import isCreditCardExpired from 'src/utilities/isCreditCardExpired';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  expired: {
    color: theme.color.red
  },
  balance: {
    display: 'flex'
  },
  positive: {
    color: theme.color.green
  },
  negative: {
    color: theme.color.red
  }
}));

interface Props {
  balanceUninvoiced: number;
  balance: number;
  expiry: string;
  lastFour: string;
}

type CombinedProps = Props;

const BillingInformation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { balance, balanceUninvoiced, lastFour, expiry } = props;

  return (
    <Paper className={classes.summarySection} data-qa-billing-summary>
      <Typography variant="h3" className={classes.title}>
        Billing Information
      </Typography>
      {balanceUninvoiced !== undefined && (
        <div className={classes.section} data-qa-contact-cc>
          <strong>Uninvoiced Balance:&nbsp;</strong>
          <Currency quantity={balanceUninvoiced} />
        </div>
      )}
      <div
        className={`${classes.section} ${classes.balance}`}
        data-qa-current-balance
      >
        <strong>Current Balance:&nbsp;</strong>
        <Typography
          component={'span'}
          className={classNames({
            [classes.negative]: balance > 0,
            [classes.positive]: balance <= 0
          })}
        >
          <Currency quantity={Math.abs(balance)} />
          {balance < 0 && ` (credit)`}
        </Typography>
      </div>
      <div className={classes.section} data-qa-contact-cc>
        <strong>Credit Card: </strong>
        {lastFour ? `xxxx-xxxx-xxxx-${lastFour}` : 'None'}
      </div>
      <div className={classes.section} data-qa-contact-cc-exp-date>
        <strong>Expiration Date: </strong>
        {expiry ? `${expiry} ` : 'None'}
        {expiry && isCreditCardExpired(expiry) && (
          <span className={classes.expired}>Expired</span>
        )}
      </div>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(BillingInformation);
