import { compose, lensPath, set, view } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { AccountsAndPasswords, BillingAndPayments } from 'src/documentation';
import { Requestable } from 'src/requestableContext';
import { getAccountInfo } from 'src/services/account';
import composeState from 'src/utilities/composeState';
import MakeAPaymentPanel from './BillingPanels/MakeAPaymentPanel';
import RecentInvoicesPanel from './BillingPanels/RecentInvoicesPanel';
import RecentPaymentsPanel from './BillingPanels/RecentPaymentsPanel';
import SummaryPanel from './BillingPanels/SummaryPanel';
import UpdateContactInformationPanel from './BillingPanels/UpdateContactInformationPanel';
import UpdateCreditCardPanel from './BillingPanels/UpdateCreditCardPanel';
import { AccountProvider } from './context';

type ClassNames = 'root' | 'main' | 'sidebar' | 'heading';

const styles = (theme: Theme) =>
  createStyles({
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
});

interface PreloadedProps {
  account: { response: Linode.Account };
}

interface State {
  account: Requestable<Linode.Account>;
}

type CombinedProps = SetDocsProps & PreloadedProps & WithStyles<ClassNames>;

const account = (path: string) => lensPath(['account', path]);

const L = {
  account: {
    data: account('data'),
    errors: account('errors'),
    lastUpdated: account('lastUpdated'),
    loading: account('loading')
  }
};

export class BillingDetail extends React.Component<CombinedProps, State> {
  static docs = [BillingAndPayments, AccountsAndPasswords];

  composeState = composeState;

  getAccount = () => {
    this.composeState([
      set(L.account.loading, true),
      set(L.account.errors, undefined)
    ]);

    return getAccountInfo()
      .then(data => {
        this.composeState([
          set(L.account.data, data),
          set(L.account.lastUpdated, Date.now()),
          set(L.account.loading, false)
        ]);
      })
      .catch(errors => {
        this.composeState([
          set(L.account.loading, false),
          set(L.account.lastUpdated, Date.now()),
          set(L.account.errors, [{ reason: 'Unable to load account details.' }])
        ]);
      });
  };

  state: State = {
    account: {
      lastUpdated: 0,
      loading: true,
      request: this.getAccount,
      update: (updater: (s: Linode.Account) => Linode.Account) => {
        const data = view<State, Linode.Account>(L.account.data, this.state);

        if (!data) {
          return;
        }

        this.composeState([set(L.account.data, updater(data))]);
      }
    }
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.getAccount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`Account & Billing`} />
        <AccountProvider value={this.state.account}>
          <Typography variant="h2" className={classes.heading}>
            Billing
          </Typography>
          <Grid container>
            <Grid item xs={12} md={3} className={classes.sidebar}>
              <SummaryPanel data-qa-summary-panel />
            </Grid>
            <Grid item xs={12} md={9} className={classes.main}>
              <UpdateContactInformationPanel />
              <UpdateCreditCardPanel />
              <MakeAPaymentPanel />
              <RecentInvoicesPanel />
              <RecentPaymentsPanel />
            </Grid>
          </Grid>
        </AccountProvider>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose(
  styled,
  setDocs(BillingDetail.docs)
)(BillingDetail);
