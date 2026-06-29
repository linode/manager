import { useNavigate, useParams, useRouterState } from '@tanstack/react-router';
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
  const { routeId } = useRouterState({
    select: (s) => s.matches[s.matches.length - 1],
  });
  const { regionId, bucketName } = useParams({ strict: false });

  const drawer: BucketDrawerState | null = useMemo(() => {
    switch (routeId) {
      case `${BUCKETS_BASE_URL}/$regionId/$bucketName/details`:
        return { type: 'bucket-details', regionId, bucketName };
      case `${BUCKETS_BASE_URL}/create`:
        return { type: 'create-bucket' };
      default:
        return null;
    }
  }, [routeId, regionId, bucketName]);

  function openDrawer(
    drawer: BucketDrawerType,
    regionId?: string,
    bucketName?: string
  ) {
    switch (drawer) {
      case 'bucket-details':
        navigate({
          to: `${BUCKETS_BASE_URL}/${regionId}/${bucketName}/details`,
          search: true,
        });
        break;
      case 'create-bucket':
        navigate({ to: `${BUCKETS_BASE_URL}/create`, search: true });
        break;
    }
  }

  function closeDrawer() {
    navigate({ to: BUCKETS_BASE_URL, search: true });
  }

  return {
    drawer,
    openDrawer,
    closeDrawer,
  };
};
