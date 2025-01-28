import { Typography } from '@linode/ui';
import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const ImagesLanding = React.lazy(() => import('./ImagesLanding/ImagesLanding'));
const ImageCreate = React.lazy(
  () => import('./ImagesCreate/ImageCreateContainer')
);

export const ImagesRoutes = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Images" />
      <DismissibleBanner
        preferenceKey="image-encryption"
        spacingBottom={8}
        variant="info"
      >
        <Typography fontSize="inherit">
          Image encryption is automatically applied when you create a new image.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image#capture-an-image">
            Learn how
          </Link>{' '}
          to update and protect your images.
        </Typography>
      </DismissibleBanner>
      <Switch>
        <Route component={ImagesLanding} exact path={path} />
        <Route component={ImageCreate} path={`${path}/create`} />
        <Redirect to="/images" />
      </Switch>
    </React.Suspense>
  );
};

export default ImagesRoutes;
