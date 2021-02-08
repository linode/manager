import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const AccountLanding = React.lazy(() =>
  import('src/features/Account/AccountLanding')
);
const InvoiceDetail = React.lazy(() =>
  import('src/features/Billing/InvoiceDetail')
);
const EntityTransfers = React.lazy(() =>
  import('src/features/EntityTransfers')
);
const UserDetail = React.lazy(() => import('src/features/Users/UserDetail'));

type Props = RouteComponentProps<{}>;

class Account extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route path={`${path}/users/:username`} component={UserDetail} />
          <Route
            exact
            path={`${path}/billing/invoices/:invoiceId`}
            component={InvoiceDetail}
          />
          <Route
            path={`${path}/entity-transfers`}
            component={EntityTransfers}
          />
          <Route path={`${path}`} component={AccountLanding} />
        </Switch>
      </React.Suspense>
    );
  }
}
export default Account;
