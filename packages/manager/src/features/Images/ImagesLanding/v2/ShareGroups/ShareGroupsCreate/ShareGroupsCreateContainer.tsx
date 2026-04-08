import Grid from '@mui/material/Grid';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';

import { ShareGroupsCreate } from './ShareGroupsCreate';

export const ShareGroupsCreateContainer = () => {
  return (
    <>
      <DocumentTitleSegment segment="Create a Share Group" />
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/image-sharing"
        spacingBottom={4}
        title="Create"
      />
      <Grid size={12}>
        <ShareGroupsCreate />
      </Grid>
    </>
  );
};
