import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

const InvoiceDetail = React.lazy(() =>
  import('src/features/Billing/InvoiceDetail')
);
const UserDetail = React.lazy(() => import('src/features/Users/UserDetail'));
const AccountLanding = React.lazy(() =>
  import('src/features/Account/AccountLanding')
);

type Props = RouteComponentProps<{}>;

class Account extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route path={`${path}/users/:username`} component={UserDetail} />
        <Route
          exact
          path={`${path}/billing/invoices/:invoiceId`}
          component={InvoiceDetail}
        />
        <Route path={`${path}`} component={AccountLanding} />
      </Switch>
    );
  }
}
export default Account;
