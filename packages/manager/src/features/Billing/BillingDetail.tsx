import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { AccountsAndPasswords, BillingAndPayments } from 'src/documentation';
import { useAccount } from 'src/queries/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import BillingActivityPanel from './BillingPanels/BillingActivityPanel/BillingActivityPanel';
import BillingSummary from './BillingPanels/BillingSummary';
import ContactInfo from './BillingPanels/ContactInfoPanel';
import PaymentInformation from './BillingPanels/PaymentInfoPanel';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  heading: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

type CombinedProps = SetDocsProps & RouteComponentProps<{}>;

export const BillingDetail: React.FC<CombinedProps> = (props) => {
  const {
    data: account,
    error: accountError,
    isLoading: accountLoading,
  } = useAccount();

  const classes = useStyles();

  if (accountLoading) {
    return <CircleProgress />;
  }

  if (accountError) {
    const errorText = getAPIErrorOrDefault(
      accountError,
      'There was an error retrieving your account data.'
    )[0].reason;
    return <ErrorState errorText={errorText} />;
  }

  if (!account) {
    return null;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Account & Billing`} />
      <div data-testid="billing-detail">
        <Grid container>
          <Grid item xs={12} md={12} lg={12} className={classes.main}>
            <BillingSummary
              balance={account?.balance ?? 0}
              promotions={account?.active_promotions}
              balanceUninvoiced={account?.balance_uninvoiced ?? 0}
            />
            <Grid container direction="row">
              <ContactInfo
                company={account.company}
                firstName={account.first_name}
                lastName={account.last_name}
                address1={account.address_1}
                address2={account.address_2}
                email={account.email}
                phone={account.phone}
                city={account.city}
                state={account.state}
                zip={account.zip}
                history={props.history}
                taxId={account.tax_id}
              />
              <PaymentInformation
                balance={account?.balance ?? 0}
                balanceUninvoiced={account?.balance_uninvoiced ?? 0}
                expiry={account?.credit_card?.expiry ?? ''}
                lastFour={account?.credit_card?.last_four ?? ''}
                promoCredit={
                  account?.active_promotions?.[0]?.this_month_credit_remaining
                }
              />
            </Grid>
            <BillingActivityPanel accountActiveSince={account?.active_since} />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

const docs = [BillingAndPayments, AccountsAndPasswords];

export default compose<CombinedProps, {}>(setDocs(docs))(BillingDetail);
