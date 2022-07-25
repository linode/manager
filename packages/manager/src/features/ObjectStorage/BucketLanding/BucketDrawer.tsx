import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Drawer from 'src/components/Drawer';
import bucketDrawerContainer, {
  DispatchProps,
  StateProps,
} from 'src/containers/bucketDrawer.container';
import CreateBucketForm from './CreateBucketForm';

export type CombinedProps = StateProps & DispatchProps;

export const BucketDrawer = (props: CombinedProps) => {
  const { isOpen, closeBucketDrawer } = props;

  const { replace } = useHistory();

  const closeDrawer = React.useCallback(() => {
    closeBucketDrawer();
    replace('/object-storage/buckets');
  }, [closeBucketDrawer, replace]);

  return (
    <Drawer onClose={closeDrawer} open={isOpen} title="Create Bucket">
      <CreateBucketForm onClose={closeDrawer} onSuccess={closeDrawer} />
    </Drawer>
  );
};

export default bucketDrawerContainer(BucketDrawer);
