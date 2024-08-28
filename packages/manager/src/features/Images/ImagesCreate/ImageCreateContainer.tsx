import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import ImageCreate from './ImageCreate';

export const ImagesCreateContainer = () => {
  return (
    (<Grid container>
      <LandingHeader
        breadcrumbDataAttrs={{ 'data-qa-create-image-header': true }}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/products/tools/images/"
        removeCrumbX={2}
        title="Create"
      />
      <Grid className="p0" size={12}>
        <ImageCreate />
      </Grid>
    </Grid>)
  );
};

export default ImagesCreateContainer;
