import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

export const EntityTransfersLanding: React.FC<{}> = _ => {
  return (
    <>
      <DocumentTitleSegment segment="Transfers" />
      <Breadcrumb pathname={location.pathname} labelTitle="Transfers" />
    </>
  );
};

export default EntityTransfersLanding;
