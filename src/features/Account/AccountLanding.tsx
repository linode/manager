import * as React from 'react';

import { compose } from 'ramda';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import PromiseLoader from 'src/components/PromiseLoader';

import SummaryPanel from './AccountPanels/SummaryPanel';

import { getAccountInfo } from 'src/services/account';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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
    const { response: account } = this.props.account;
    
    return (
      <React.Fragment>
        <Typography variant="headline">
          Billing
        </Typography>
        <SummaryPanel
          email={account.email}
          name={`${account.first_name} ${account.last_name}`}
          phone={account.phone}
          company={account.company}
          address1={account.address_1}
          address2={account.address_2}
          cc_exp={account.credit_card.expiry}
          cc_lastfour={account.credit_card.last_four}
          city={account.city}
          state={account.state}
          zip={account.zip}
        />
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
