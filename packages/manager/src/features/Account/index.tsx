import * as React from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const AccountLanding = React.lazy(
  () => import('src/features/Account/AccountLanding')
);
const InvoiceDetail = React.lazy(() =>
  import('src/features/Billing/InvoiceDetail/InvoiceDetail').then((module) => ({
    default: module.InvoiceDetail,
  }))
);
const EntityTransfersCreate = React.lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersCreate/EntityTransfersCreate'
  ).then((module) => ({
    default: module.EntityTransfersCreate,
  }))
);

const UserDetail = React.lazy(() =>
  import('../Users/UserDetail').then((module) => ({
    default: module.UserDetail,
  }))
);

type Props = RouteComponentProps<{}>;

export class Account extends React.Component<Props> {
  render() {
    const {
      match: { path },
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <ProductInformationBanner bannerLocation="Account" />
        <Switch>
          <Route component={UserDetail} path={`${path}/users/:username`} />
          <Route
            component={AccountLanding}
            exact
            path={`${path}/billing/edit`}
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
          <Redirect exact from={path} to={`${path}/billing`} />
          <Route component={AccountLanding} path={path} />
        </Switch>
      </React.Suspense>
    );
  }
}
