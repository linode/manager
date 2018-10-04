import { compose, lensPath, set, view } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Requestable } from 'src/requestableContext';
import { getAccountInfo } from 'src/services/account';
import composeState from 'src/utilities/composeState';

import MakeAPaymentPanel from './AccountPanels/MakeAPaymentPanel';
import RecentInvoicesPanel from './AccountPanels/RecentInvoicesPanel';
import RecentPaymentsPanel from './AccountPanels/RecentPaymentsPanel';
import SummaryPanel from './AccountPanels/SummaryPanel';
import UpdateContactInformationPanel from './AccountPanels/UpdateContactInformationPanel';
import UpdateCreditCardPanel from './AccountPanels/UpdateCreditCardPanel';
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

export class AccountDetail extends React.Component<CombinedProps, State> {
  static docs = [
    {
      title: 'Billing and Payments',
      src: 'https://www.linode.com/docs/platform/billing-and-payments/',
      body: `Our guide to billing and payments.`,
    },
    {
      title: 'Accounts and Passwords',
      src: 'https://www.linode.com/docs/platform/accounts-and-passwords/',
      body: `Our guide to managing accounts and passwords.`,
    },
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

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  setDocs(AccountDetail.docs),
)(AccountDetail);
