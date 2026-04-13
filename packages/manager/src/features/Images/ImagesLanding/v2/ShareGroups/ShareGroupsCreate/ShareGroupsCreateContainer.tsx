import Grid from '@mui/material/Grid';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';

import { CREATE_SHARE_GROUP_PENDO_IDS } from '../../constants';
import { ShareGroupsCreate } from './ShareGroupsCreate';

export const ShareGroupsCreateContainer = () => {
  return (
    <>
      <DocumentTitleSegment segment="Create a Share Group" />
      <LandingHeader
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/image-sharing"
        pendoId={CREATE_SHARE_GROUP_PENDO_IDS.landingHeader}
        spacingBottom={4}
        title="Create"
      />
      <Grid size={12}>
        <ShareGroupsCreate />
      </Grid>
    </>
  );
};
