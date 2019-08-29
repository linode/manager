import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';

import styled from 'src/containers/SummaryPanels.styles';
import useFlags from 'src/hooks/useFlags';

import BillingSection from './BillingSection';
import CreditCard from './CreditCard';

const useStyles = makeStyles((theme: Theme) => ({
  ...styled(theme),
  billingGroup: {
    marginBottom: theme.spacing(3)
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

const BillingInformation: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const flags = useFlags();

  const { balance, balanceUninvoiced, lastFour, expiry, promoCredit } = props;
  const credit = promoCredit ? +promoCredit : 0;
  return (
    <Paper className={classes.summarySection} data-qa-billing-summary>
      <Typography variant="h3" className={classes.title}>
        Billing Information
      </Typography>

      <div className={classes.billingGroup}>
        <CreditCard lastFour={lastFour} expiry={expiry} />
      </div>
      <div className={classes.billingGroup}>
        {balance < 0 && (
          <BillingSection
            header="Current Balance:&nbsp;"
            balance={balance}
            data-qa-balance
          />
        )}
        <BillingSection
          header="Amount Due:&nbsp;"
          balance={Math.max(balance, 0)}
          data-qa-balance
        />
      </div>

      <div className={classes.billingGroup}>
        {balanceUninvoiced !== undefined && (
          <>
            <BillingSection
              header="Uninvoiced Balance:&nbsp;"
              balance={balanceUninvoiced}
              textColor={false}
              data-qa-uninvoiced-balance
            />

            {flags.promos && promoCredit && (
              <>
                <BillingSection
                  header="Promotional Credit:&nbsp;"
                  credit={credit}
                  data-qa-promotional-credit
                />

                <BillingSection
                  header="Adjusted Uninvoiced Balance:&nbsp;"
                  balance={Math.max(0, balanceUninvoiced - credit)}
                  textColor={false}
                  data-qa-amount-due
                />
              </>
            )}
          </>
        )}
      </div>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(React.memo)(BillingInformation);
