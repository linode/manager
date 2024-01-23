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

// TODO VM_Placement: add <PlacementGroupsDetail />
// const PlacementGroupDetail = React.lazy(() =>
//   import('./PlacementGroupDetail/PlacementGroupDetail').then((module) => ({
//     default: module.PlacementGroupsDetail,
//   }))
// );

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
          {/*
            // TODO VM_Placement: add <PlacementGroupsDetail />
            <Route component={FirewallDetail} path={`${path}/:id/:tab?`} />
          */}
          <Route component={PlacementGroupsLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};
