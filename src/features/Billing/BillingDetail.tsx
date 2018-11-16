import { compose, lensPath, set, view } from 'ramda';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
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

type ClassNames = 'root' | 'heading';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  heading: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface PreloadedProps {
  account: { response: Linode.Account };
}

interface State {
  account: Requestable<Linode.Account>,
}

type CombinedProps = SetDocsProps
  & PreloadedProps
  & WithStyles<ClassNames>;

const account = (path: string) => lensPath(['account', path]);

const L = {
  account: {
    data: account('data'),
    errors: account('errors'),
    lastUpdated: account('lastUpdated'),
    loading: account('loading'),
  },
};

export class BillingDetail extends React.Component<CombinedProps, State> {
  static docs = [
    BillingAndPayments,
    AccountsAndPasswords,
  ];

  composeState = composeState;

  getAccount = () => {
    this.composeState([
      set(L.account.loading, true),
      set(L.account.errors, undefined),
    ])

    return getAccountInfo()
      .then((data) => {
        this.composeState([
          set(L.account.data, data),
          set(L.account.lastUpdated, Date.now()),
          set(L.account.loading, false),
        ]);
      })
      .catch((errors) => {
        this.composeState([
          set(L.account.loading, false),
          set(L.account.lastUpdated, Date.now()),
          set(L.account.errors, [{ reason: 'Unable to load account details.' }]),
        ]);
      });
  }

  state: State = {
    account: {
      lastUpdated: 0,
      loading: true,
      request: this.getAccount,
      update: (updater: (s: Linode.Account) => Linode.Account) => {
        const data = view<State, Linode.Account>(L.account.data, this.state);

        if (!data) { return; }

        this.composeState([
          set(L.account.data, updater(data)),
        ]);
      },
    },
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
          <Typography role="header" variant="headline" className={classes.heading}>Billing</Typography>
          <SummaryPanel />

          <UpdateContactInformationPanel />
          <UpdateCreditCardPanel />
          <MakeAPaymentPanel />
          <RecentInvoicesPanel />
          <RecentPaymentsPanel />
        </AccountProvider >
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose(
  styled,
  setDocs(BillingDetail.docs),
)(BillingDetail);
