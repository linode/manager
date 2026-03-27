import React from 'react';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { useBucketDrawers } from './hooks/useBucketDrawers';
import { CreateBucketDrawer } from './OMC_CreateBucketDrawer';

export const BucketDrawerOutlet = () => {
  const { drawer, closeDrawer } = useBucketDrawers();

  return (
    <>
      <CreateBucketDrawer
        isOpen={drawer === 'create-bucket'}
        onClose={closeDrawer}
      />

      <BucketDetailsDrawer
        isOpen={drawer === 'bucket-details'}
        onClose={closeDrawer}
      />
    </>
  );
};
