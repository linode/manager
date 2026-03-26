import React from 'react';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { CreateBucketDrawer } from './CreateBucketDrawer';
import { useBucketDrawers } from './hooks/useBucketDrawers';

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
