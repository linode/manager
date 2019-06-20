import * as React from 'react';
import { compose } from 'recompose';
import Drawer from 'src/components/Drawer';
import bucketDrawerContainer, {
  DispatchProps,
  StateProps
} from 'src/containers/bucketDrawer.container';
import CreateBucketForm from './CreateBucketForm';

type CombinedProps = StateProps & DispatchProps;

export const BucketDrawer: React.StatelessComponent<CombinedProps> = props => {
  const { isOpen, closeBucketDrawer } = props;

  return (
    <Drawer onClose={closeBucketDrawer} open={isOpen} title="Create a Bucket">
      <CreateBucketForm
        onClose={closeBucketDrawer}
        onSuccess={() => closeBucketDrawer()}
      />
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, {}>(bucketDrawerContainer);
export default enhanced(BucketDrawer);
