import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const PlacementGroupsLanding = React.lazy(() =>
  import('./PlacementGroupsLanding/PlacementGroupsLanding').then((module) => ({
    default: module.PlacementGroupsLanding,
  }))
);

const PlacementGroupsDetail = React.lazy(() =>
  import('./PlacementGroupsDetail/PlacementGroupsDetail').then((module) => ({
    default: module.PlacementGroupsDetail,
  }))
);

export const PlacementGroups = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="Placement Groups" />
        <ProductInformationBanner bannerLocation="Placement Groups" />
        <Switch>
          <Route
            component={PlacementGroupsLanding}
            exact
            path={`${path}/create`}
          />
          <Route
            component={PlacementGroupsLanding}
            exact
            path={`${path}/rename/:id`}
          />
          <Route component={PlacementGroupsDetail} path={`${path}/:id/:tab?`} />
          <Route
            component={PlacementGroupsDetail}
            exact
            path={`${path}/:id/linodes/assign`}
          />
          <Route component={PlacementGroupsLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};
