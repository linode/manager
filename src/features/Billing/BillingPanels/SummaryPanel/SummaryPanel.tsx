import { path } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import withProfile from 'src/containers/profile.container';
import { withAccount } from '../../context';

import BillingInfo from './PanelCards/BillingInformation';
import ContactInfo from './PanelCards/ContactInformation';

interface AccountContextProps {
  errors?: Linode.ApiFieldError[];
  lastUpdated: number;
  data?: Linode.Account;
  accountLoading: boolean;
}

export type CombinedProps = AccountContextProps & Profile;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const {
      data,
      accountLoading,
      errors,
      username,
      profileError,
      profileLoading
    } = this.props;

    if (accountLoading || profileLoading) {
      return <CircleProgress noTopMargin />;
    }

    if (errors || profileError) {
      return <ErrorState compact errorText="Unable to load account details." />;
    }

    if (!data || !username) {
      return null;
    }

    return (
      <React.Fragment>
        <ContactInfo
          username={username}
          company={data.company}
          firstName={data.first_name}
          lastName={data.last_name}
          address1={data.address_1}
          address2={data.address_2}
          email={data.email}
          phone={data.phone}
          city={data.city}
          state={data.state}
          zip={data.zip}
          activeSince={data.active_since}
        />
        <BillingInfo
          balance={data.balance}
          balanceUninvoiced={data.balance_uninvoiced}
          expiry={data.credit_card.expiry}
          lastFour={data.credit_card.last_four}
        />
      </React.Fragment>
    );
  }
}

const accountContext = withAccount(
  ({ data, errors, loading, lastUpdated }) => ({
    accountLoading: loading,
    errors,
    lastUpdated,
    data
  })
);

interface Profile {
  profileLoading: boolean;
  profileError?: Linode.ApiFieldError[];
  username?: string;
}

const enhanced = compose<CombinedProps, {}>(
  accountContext,
  withProfile<Profile, {}>((ownProps, profile) => ({
    username: path(['username'], profile.data),
    profileError: path(['read'], profile.error),
    profileLoading: profile.loading
  }))
);

export default enhanced(SummaryPanel) as React.ComponentType<{}>;
