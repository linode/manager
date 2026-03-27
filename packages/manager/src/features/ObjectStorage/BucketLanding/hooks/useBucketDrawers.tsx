import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

type BucketDrawerType = 'bucket-details' | 'create-bucket';

const BUCKETS_BASE_URL = '/object-storage/buckets';

interface BucketDrawerState {
  bucketName?: string;
  regionId?: string;
  type: BucketDrawerType;
}

export const useBucketDrawers = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });
  const { regionId, bucketName } = useParams({ strict: false });

  function getDrawer(): BucketDrawerState | null {
    switch (routeId) {
      case `${BUCKETS_BASE_URL}/$regionId/$bucketName/details`:
        return { type: 'bucket-details', regionId, bucketName };
      case `${BUCKETS_BASE_URL}/create`:
        return { type: 'create-bucket' };
      default:
        return null;
    }
  }

  function openDrawer(
    drawer: BucketDrawerType,
    regionId?: string,
    bucketName?: string
  ) {
    switch (drawer) {
      case 'bucket-details':
        navigate({
          to: `${BUCKETS_BASE_URL}/${regionId}/${bucketName}/details`,
        });
        break;
      case 'create-bucket':
        navigate({ to: `${BUCKETS_BASE_URL}/create` });
        break;
    }
  }

  function closeDrawer() {
    navigate({ to: BUCKETS_BASE_URL });
  }

  return {
    drawer: useMemo(() => getDrawer(), [routeId]),
    openDrawer,
    closeDrawer,
  };
};
