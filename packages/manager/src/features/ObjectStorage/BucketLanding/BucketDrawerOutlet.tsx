import React from 'react';

import { useObjectStorageBucket } from 'src/queries/object-storage/queries';

import { BucketDetailsDrawer } from './BucketDetailsDrawer';
import { useBucketDrawers } from './hooks/useBucketDrawers';
import { CreateBucketDrawer } from './OMC_CreateBucketDrawer';

export const BucketDrawerOutlet = () => {
  const { drawer, closeDrawer } = useBucketDrawers();

  const { data: bucket } = useObjectStorageBucket(
    drawer?.regionId,
    drawer?.bucketName
  );

  return (
    <>
      <CreateBucketDrawer
        isOpen={drawer?.type === 'create-bucket'}
        onClose={closeDrawer}
      />

      <BucketDetailsDrawer
        bucket={bucket}
        isOpen={drawer?.type === 'bucket-details'}
        onClose={closeDrawer}
      />
    </>
  );
};
