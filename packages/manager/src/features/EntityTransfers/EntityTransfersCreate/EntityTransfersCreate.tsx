import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TransferCheckoutBar from './TransferCheckoutBar';
import TransferHeader from './TransferHeader';
import LinodeTransferTable from './LinodeTransferTable';

export const EntityTransfersCreate: React.FC<{}> = _ => {
  return (
    <>
      <DocumentTitleSegment segment="Make a Transfer" />
      <Breadcrumb
        pathname={location.pathname}
        labelTitle="Make a Transfer"
        labelOptions={{ noCap: true }}
        crumbOverrides={[
          {
            position: 2,
            label: 'Transfers'
          }
        ]}
      />
      <Grid container>
        <Grid item xs={9}>
          <TransferHeader />
          <LinodeTransferTable />
        </Grid>
        <Grid item xs={3} className="mlSidebar">
          <TransferCheckoutBar />
        </Grid>
      </Grid>
    </>
  );
};

export default EntityTransfersCreate;
