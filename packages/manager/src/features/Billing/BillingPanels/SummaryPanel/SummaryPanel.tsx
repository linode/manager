import { path, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import withAccount from 'src/containers/account.container';
import withProfile from 'src/containers/profile.container';

import BillingInfo from './PanelCards/BillingInformation';
import ContactInfo from './PanelCards/ContactInformation';

interface AccountContextProps {
  accountError?: Linode.ApiFieldError[];
  lastUpdated: number;
  account?: Linode.Account;
  accountLoading: boolean;
}

export type CombinedProps = AccountContextProps & Profile;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const {
      account,
      accountError,
      accountLoading,
      username,
      profileError,
      profileLoading,
      isRestricted
    } = this.props;

    if (accountLoading || profileLoading) {
      return <CircleProgress noTopMargin />;
    }

    if (accountError || profileError) {
      return <ErrorState compact errorText="Unable to load account details." />;
    }

    if (!account || !username) {
      return null;
    }

    return (
      <React.Fragment>
        <ContactInfo
          username={username}
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
          activeSince={account.active_since}
          isRestrictedUser={isRestricted}
        />
        <BillingInfo
          balance={account.balance}
          balanceUninvoiced={account.balance_uninvoiced}
          expiry={account.credit_card.expiry}
          lastFour={account.credit_card.last_four}
          promoCredit={account.active_promotions.this_month_credit_remaining}
        />
      </React.Fragment>
    );
  }
}

interface Profile {
  profileLoading: boolean;
  profileError?: Linode.ApiFieldError[];
  username?: string;
  isRestricted: boolean;
}

const enhanced = compose<CombinedProps, {}>(
  withAccount(
    (ownProps, accountLoading, lastUpdated, accountError, account) => ({
      accountLoading,
      lastUpdated,
      accountError: accountError.read,
      account
    })
  ),
  withProfile<Profile, {}>((ownProps, profile) => ({
    username: path(['username'], profile.data),
    profileError: path(['read'], profile.error),
    profileLoading: profile.loading,
    isRestricted: pathOr(false, ['restricted'], profile.data)
  }))
);

export default enhanced(SummaryPanel) as React.ComponentType<{}>;
