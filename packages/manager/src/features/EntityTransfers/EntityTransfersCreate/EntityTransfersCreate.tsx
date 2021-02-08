import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const EntityTransfersCreate: React.FC<Props> = props => {
  return (
    <>
      <DocumentTitleSegment segment="Create a Transfer" />
      <Breadcrumb
        pathname={location.pathname}
        labelTitle="Create a Transfer"
        labelOptions={{ noCap: true }}
        crumbOverrides={[
          {
            position: 2,
            label: 'Transfers'
          }
        ]}
      />
    </>
  );
};

export default EntityTransfersCreate;
