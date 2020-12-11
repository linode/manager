import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import Drawer from 'src/components/Drawer';
import bucketDrawerContainer, {
  DispatchProps,
  StateProps
} from 'src/containers/bucketDrawer.container';
import CreateBucketForm from './CreateBucketForm';

interface Props {
  isRestrictedUser: boolean;
}

export type CombinedProps = Props & StateProps & DispatchProps;

export const BucketDrawer: React.FC<CombinedProps> = props => {
  const { isOpen, isRestrictedUser, closeBucketDrawer } = props;

  const { replace } = useHistory();

  const closeDrawer = React.useCallback(() => {
    closeBucketDrawer();
    replace('/object-storage/buckets');
  }, [closeBucketDrawer, replace]);

  return (
    <Drawer onClose={closeBucketDrawer} open={isOpen} title="Create a Bucket">
      <CreateBucketForm
        isRestrictedUser={isRestrictedUser}
        onClose={closeDrawer}
        onSuccess={closeDrawer}
      />
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, Props>(bucketDrawerContainer);
export default enhanced(BucketDrawer);
