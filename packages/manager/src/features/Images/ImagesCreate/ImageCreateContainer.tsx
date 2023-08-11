import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

import ImageCreate from './ImageCreate';

export const ImagesCreateContainer = () => {
  return (
    <Grid container>
      <ProductInformationBanner
        bannerLocation="Images"
        important
        sx={{ width: '100%' }}
        warning
      />
      <LandingHeader
        breadcrumbDataAttrs={{ 'data-qa-create-image-header': true }}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/products/tools/images/"
        removeCrumbX={2}
        title="Create"
      />
      <Grid className="p0" xs={12}>
        <ImageCreate />
      </Grid>
    </Grid>
  );
};

export default ImagesCreateContainer;
