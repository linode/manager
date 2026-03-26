import { useMatch, useNavigate } from '@tanstack/react-router';

type BucketDrawers = 'bucket-details' | 'create-bucket';

const BUCKETS_BASE_URL = '/object-storage/buckets';

export const useBucketDrawers = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });

  function getDrawer(): BucketDrawers | null {
    switch (routeId) {
      case `${BUCKETS_BASE_URL}/$regionId/$bucketName/details`:
        return 'bucket-details';
      case `${BUCKETS_BASE_URL}/create`:
        return 'create-bucket';
      default:
        return null;
    }
  }

  function openDrawer(
    drawer: BucketDrawers,
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
    drawer: getDrawer(),
    openDrawer,
    closeDrawer,
  };
};
