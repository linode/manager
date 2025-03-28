import Grid from '@mui/material/Grid';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import { ImageCreate } from './ImageCreate';

export const ImagesCreateContainer = () => {
  return (
    <Grid container>
      <LandingHeader
        breadcrumbDataAttrs={{ 'data-qa-create-image-header': true }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/images"
        removeCrumbX={2}
        title="Create"
      />
      <Grid className="p0" size={12}>
        <ImageCreate />
      </Grid>
    </Grid>
  );
};
