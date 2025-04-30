import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import { ImageCreate } from './ImageCreate';

export const ImagesCreateContainer = () => {
  return (
    <>
      <LandingHeader
        breadcrumbDataAttrs={{ 'data-qa-create-image-header': true }}
        className="landing-header-mb-4"
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/images"
        removeCrumbX={2}
        title="Create"
      />
      <Grid className="p0" size={12}>
        <ImageCreate />
      </Grid>
    </>
  );
};
