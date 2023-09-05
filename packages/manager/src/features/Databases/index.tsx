import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const DatabaseLanding = React.lazy(() => import('./DatabaseLanding'));
const DatabaseDetail = React.lazy(() => import('./DatabaseDetail'));
const DatabaseCreate = React.lazy(() => import('./DatabaseCreate'));

const Database = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Databases" />
      <ProductInformationBanner bannerLocation="Databases" />
      <Switch>
        <Route component={DatabaseLanding} exact path={path} />
        <Route component={DatabaseCreate} path={`${path}/create`} />
        <Route
          component={DatabaseDetail}
          path={`${path}/:engine/:databaseId`}
        />
        <Redirect to="/databases" />
      </Switch>
    </React.Suspense>
  );
};

export default Database;
