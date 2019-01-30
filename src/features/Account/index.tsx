import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const InvoiceDetail = DefaultLoader({
  loader: () => import('src/features/Billing/InvoiceDetail')
});

const UserDetail = DefaultLoader({
  loader: () => import('src/features/Users/UserDetail')
});

const AccountLanding = DefaultLoader({
  loader: () => import('src/features/Account/AccountLanding')
});

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
export default withRouter(Account);
