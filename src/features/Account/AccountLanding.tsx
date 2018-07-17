import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader from 'src/components/PromiseLoader';
import { getAccountInfo } from 'src/services/account';

import MakeAPaymentPanel from './AccountPanels/MakeAPaymentPanel';
import RecentBillingActivityPanel from './AccountPanels/RecentBillingActivityPanel';
import SummaryPanel from './AccountPanels/SummaryPanel';
import UpdateContactInformationPanel from './AccountPanels/UpdateContactInformationPanel';
import UpdateCreditCardPanel from './AccountPanels/UpdateCreditCardPanel';

type ClassNames = 'root'
| 'title'
| 'heading';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  heading: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 2,
  },
});

const preloaded = PromiseLoader<Props>({
  account: () => getAccountInfo()
    .then(response => response || null),
});

interface PreloadedProps {
  account: { response: Linode.Account };
}

interface Props { }

interface State { }

type CombinedProps = Props
  & SetDocsProps
  & PreloadedProps
  & WithStyles<ClassNames>;

export class AccountLanding extends React.Component<CombinedProps, State> {
  state: State = {};

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

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.title}>Billing</Typography>
        <SummaryPanel />

        <Typography variant="title" className={classes.heading}>Billing Account</Typography>
        <UpdateContactInformationPanel />

        <Typography variant="title" className={classes.heading}>Billing Information</Typography>
        <UpdateCreditCardPanel />
        <MakeAPaymentPanel />
        <RecentBillingActivityPanel />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  styled,
  preloaded,
  setDocs(AccountLanding.docs),
)(AccountLanding);
