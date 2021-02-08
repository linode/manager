import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const EntityTransfersLanding: React.FC<Props> = props => {
  return (
    <>
      <DocumentTitleSegment segment="Transfers" />
      <Breadcrumb pathname={location.pathname} labelTitle="Transfers" />
    </>
  );
};

export default EntityTransfersLanding;
