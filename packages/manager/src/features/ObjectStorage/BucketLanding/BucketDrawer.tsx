import * as React from 'react';
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

type CombinedProps = Props & StateProps & DispatchProps;

export const BucketDrawer: React.StatelessComponent<CombinedProps> = props => {
  const { isOpen, isRestrictedUser, closeBucketDrawer } = props;

  return (
    <Drawer onClose={closeBucketDrawer} open={isOpen} title="Create a Bucket">
      <CreateBucketForm
        isRestrictedUser={isRestrictedUser}
        onClose={closeBucketDrawer}
        onSuccess={() => closeBucketDrawer()}
      />
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, Props>(bucketDrawerContainer);
export default enhanced(BucketDrawer);
