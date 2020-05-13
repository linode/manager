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
import BillingActivityPanel from './BillingPanels/BillingActivityPanel';
import SummaryPanel from './BillingPanels/SummaryPanel';
import BillingSummary from './BillingSummary';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1
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

  const [mostRecentInvoiceId, setMostRecentInvoiceId] = React.useState<
    number | undefined
  >();

  // @todo: useReduxLoad for account/profile requests?
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

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`Account & Billing`} />
      <div
        id="tabpanel-billingInfo"
        role="tabpanel"
        aria-labelledby="tab-billingInfo"
        data-testid="billing-detail"
      >
        <Grid container>
          <Grid item xs={12} md={12} lg={12} className={classes.main}>
            <BillingSummary
              balance={account?.data?.balance ?? 0}
              promotion={account?.data?.active_promotions?.[0]}
              uninvoicedBalance={account?.data?.balance_uninvoiced ?? 0}
              mostRecentInvoiceId={mostRecentInvoiceId}
            />
            <SummaryPanel data-qa-summary-panel history={props.history} />
            <BillingActivityPanel
              mostRecentInvoiceId={mostRecentInvoiceId}
              setMostRecentInvoiceId={setMostRecentInvoiceId}
            />
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

const docs = [BillingAndPayments, AccountsAndPasswords];

export default compose<CombinedProps, {}>(setDocs(docs))(BillingDetail);
