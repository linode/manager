import * as React from 'react';
import { compose } from 'recompose';

import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';

import { withAccount } from '../../context';
import BillingInfo from './PanelCards/BillingInformation';
import ContactInfo from './PanelCards/ContactInformation';

interface AccountContextProps {
  errors?: Linode.ApiFieldError[];
  lastUpdated: number;
  data?: Linode.Account;
  accountLoading: boolean;
}

export type CombinedProps = AccountContextProps;

export class SummaryPanel extends React.Component<CombinedProps, {}> {
  render() {
    const { data, accountLoading, errors } = this.props;

    if (accountLoading) {
      return <CircleProgress noTopMargin />;
    }

    if (errors) {
      return <ErrorState compact errorText="Unable to load account details." />;
    }

    if (!data) {
      return null;
    }

    return (
      <React.Fragment>
        <ContactInfo
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

const enhanced = compose<CombinedProps, {}>(accountContext);

export default enhanced(SummaryPanel) as React.ComponentType<{}>;
