import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const AccountLanding = React.lazy(
  () => import('src/features/Account/AccountLanding')
);
const InvoiceDetail = React.lazy(
  () => import('src/features/Billing/InvoiceDetail')
);
const EntityTransfersCreate = React.lazy(
  () => import('src/features/EntityTransfers/EntityTransfersCreate')
);
const UserDetail = React.lazy(() => import('src/features/Users/UserDetail'));

type Props = RouteComponentProps<{}>;

class Account extends React.Component<Props> {
  render() {
    const {
      match: { path },
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={UserDetail} path={`${path}/users/:username`} />
          <Route
            path={`${path}/billing/edit`}
            component={AccountLanding}
            exact
            strict
          />
          <Route
            component={InvoiceDetail}
            path={`${path}/billing/invoices/:invoiceId`}
          />
          <Route
            component={EntityTransfersCreate}
            path={`${path}/service-transfers/create`}
          />
          <Redirect from={path} to={`${path}/billing`} exact />
          <Route component={AccountLanding} path={path} />
        </Switch>
      </React.Suspense>
    );
  }
}
export default Account;
