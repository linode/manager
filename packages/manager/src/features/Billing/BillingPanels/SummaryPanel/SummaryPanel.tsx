import { APIError } from 'linode-js-sdk/lib/types';
import { path, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import withAccount, {
  Props as AccountProps
} from 'src/containers/account.container';
import withProfile from 'src/containers/profile.container';

import BillingInfo from './PanelCards/BillingInformation';
import ContactInfo from './PanelCards/ContactInformation';

interface AccountContextProps
  extends Pick<
    AccountProps,
    'accountLoading' | 'accountLastUpdated' | 'accountData'
  > {
  _accountError?: APIError[];
}

interface Props extends Pick<RouteComponentProps, 'history'> {}

export type CombinedProps = AccountContextProps & Profile & Props;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const {
      accountData: account,
      _accountError,
      accountLoading,
      username,
      profileError,
      profileLoading,
      isRestricted
    } = this.props;

    if (accountLoading || profileLoading) {
      return <CircleProgress noTopMargin />;
    }

    if (_accountError || profileError) {
      return <ErrorState compact errorText="Unable to load account details." />;
    }

    if (!account || !username) {
      return null;
    }

    // Have to safe access since this isn't returned from production API yet
    // For now, safe to assume only one active promo will exist on an account
    const promoCredit = path<string>(
      ['active_promotions', 0, 'this_month_credit_remaining'],
      account
    );

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
          history={this.props.history}
        />
        <BillingInfo
          balance={account.balance}
          balanceUninvoiced={account.balance_uninvoiced}
          expiry={account.credit_card.expiry}
          lastFour={account.credit_card.last_four}
          promoCredit={promoCredit}
        />
      </React.Fragment>
    );
  }
}

interface Profile {
  profileLoading: boolean;
  profileError?: APIError[];
  username?: string;
  isRestricted: boolean;
}

const enhanced = compose<CombinedProps, Props>(
  withAccount<AccountContextProps, {}>(
    (
      ownProps,
      { accountLoading, accountLastUpdated, accountError, accountData }
    ) => ({
      accountLoading,
      accountLastUpdated,
      _accountError: accountError.read,
      accountData
    })
  ),
  withProfile<Profile, {}>(
    (ownProps, { profileLoading, profileData, profileError }) => ({
      username: path(['username'], profileData),
      profileError: path(['read'], profileError),
      profileLoading,
      isRestricted: pathOr(false, ['restricted'], profileData)
    })
  )
);

export default enhanced(SummaryPanel) as React.ComponentType<Props>;
