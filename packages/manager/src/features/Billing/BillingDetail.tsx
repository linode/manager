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
import { useAccount } from 'src/hooks/useAccount';
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
  const { account, requestAccount } = useAccount();

  const classes = useStyles();

  React.useEffect(() => {
    if (account.loading && account.lastUpdated === 0) {
      requestAccount();
    }
  }, [account.loading, account.lastUpdated, requestAccount]);

  if (account.loading && account.lastUpdated === 0) {
    return <CircleProgress />;
  }

  if (account.error.read) {
    const errorText = getAPIErrorOrDefault(
      account.error.read,
      'There was an error retrieving your account data.'
    )[0].reason;
    return <ErrorState errorText={errorText} />;
  }

  /* This will never happen, /account is requested on app load
  and the splash screen doesn't resolve until it succeeds */
  if (!account.data) {
    return null;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Account & Billing`} />
      <div data-testid="billing-detail">
        <Grid container>
          <Grid item xs={12} md={12} lg={12} className={classes.main}>
            <BillingSummary
              balance={account?.data?.balance ?? 0}
              promotions={account?.data?.active_promotions}
              balanceUninvoiced={account?.data?.balance_uninvoiced ?? 0}
            />
            <Grid container direction="row">
              <ContactInfo
                company={account.data.company}
                firstName={account.data.first_name}
                lastName={account.data.last_name}
                address1={account.data.address_1}
                address2={account.data.address_2}
                email={account.data.email}
                phone={account.data.phone}
                city={account.data.city}
                state={account.data.state}
                zip={account.data.zip}
                history={props.history}
                taxId={account.data.tax_id}
              />
              <PaymentInformation />
            </Grid>
            <BillingActivityPanel
              accountActiveSince={account?.data?.active_since}
            />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

const docs = [BillingAndPayments, AccountsAndPasswords];

export default compose<CombinedProps, {}>(setDocs(docs))(BillingDetail);
