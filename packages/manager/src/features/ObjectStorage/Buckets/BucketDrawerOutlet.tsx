import React from 'react';

import { BucketDetailsDrawer } from './BucketDetailsDrawer/BucketDetailsDrawer';
import { CreateBucketDrawer } from './CreateBucket/CreateBucketDrawer';
import { useBucketDrawers } from './hooks/useBucketDrawers';

export const BucketDrawerOutlet = () => {
  const { drawer, closeDrawer } = useBucketDrawers();

  return (
    <>
      <CreateBucketDrawer
        isOpen={drawer?.type === 'create-bucket'}
        onClose={closeDrawer}
      />

      <BucketDetailsDrawer
        bucketName={drawer?.bucketName}
        isOpen={drawer?.type === 'bucket-details'}
        onClose={closeDrawer}
        regionId={drawer?.regionId}
      />
    </>
  );
};
