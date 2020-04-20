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
import MakeAPaymentPanel from './BillingPanels/MakeAPaymentPanel';
import PromotionsPanel from './BillingPanels/PromotionsPanel';
import RecentInvoicesPanel from './BillingPanels/RecentInvoicesPanel';
import RecentPaymentsPanel from './BillingPanels/RecentPaymentsPanel';
import SummaryPanel from './BillingPanels/SummaryPanel';
import UpdateContactInformationPanel from './BillingPanels/UpdateContactInformationPanel';
import UpdateCreditCardPanel from './BillingPanels/UpdateCreditCardPanel';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1
    }
  },
  sidebar: {
    [theme.breakpoints.up('md')]: {
      order: 2
    }
  },
  heading: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  }
}));

type CombinedProps = SetDocsProps & RouteComponentProps<{}>;

export const BillingDetail: React.FC<CombinedProps> = props => {
  const { account, requestAccount } = useAccount();

  const classes = useStyles();

  React.useEffect(() => {
    if (account.loading && account.lastUpdated === 0) {
      requestAccount();
    }
  }, []);

  if (account.loading) {
    return <CircleProgress />;
  }

  if (account.error.read) {
    const errorText = getAPIErrorOrDefault(
      account.error.read,
      'There was an error retrieving your account data.'
    )[0].reason;
    return <ErrorState errorText={errorText} />;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Account & Billing`} />
      <div
        id="tabpanel-billingInfo"
        role="tabpanel"
        aria-labelledby="tab-billingInfo"
      >
        <Grid container>
          <Grid item xs={12} md={8} lg={9} className={classes.main}>
            <UpdateContactInformationPanel />
            <UpdateCreditCardPanel />
            <MakeAPaymentPanel />
            <PromotionsPanel />
            <RecentInvoicesPanel />
            <RecentPaymentsPanel />
          </Grid>
          <Grid item xs={12} md={4} lg={3} className={classes.sidebar}>
            <SummaryPanel data-qa-summary-panel history={props.history} />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

const docs = [BillingAndPayments, AccountsAndPasswords];

export default compose<CombinedProps, {}>(setDocs(docs))(BillingDetail);
