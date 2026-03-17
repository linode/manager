import { useMatch, useNavigate } from '@tanstack/react-router';
import React from 'react';

import { CreateBucketDrawerV1 } from '../BucketLanding/CreateBucketDrawer';
import { OMC_CreateBucketDrawer } from '../BucketLanding/OMC_CreateBucketDrawer';
import { useIsObjMultiClusterEnabled } from '../hooks/useIsObjectStorageGen2Enabled';

export const CreateBucketDrawer = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });

  const { isObjMultiClusterEnabled } = useIsObjMultiClusterEnabled();
  const isOpen = routeId.endsWith('/buckets/create');

  const onClose = () => navigate({ to: '/object-storage/buckets' });

  return isObjMultiClusterEnabled ? (
    <OMC_CreateBucketDrawer isOpen={isOpen} onClose={onClose} />
  ) : (
    <CreateBucketDrawerV1 isOpen={isOpen} onClose={onClose} />
  );
};
