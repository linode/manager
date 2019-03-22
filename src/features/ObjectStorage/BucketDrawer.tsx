import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Drawer from 'src/components/Drawer';
import bucketContainer, {
  DispatchProps as BucketContainerDispatchProps
} from 'src/containers/bucket.container';
import { ApplicationState } from 'src/store';

type CombinedProps = BucketContainerDispatchProps & StateProps;
const BucketDrawer: React.StatelessComponent<CombinedProps> = props => {
  const { isOpen, closeBucketDrawer } = props;
  return (
    <Drawer onClose={closeBucketDrawer} open={isOpen} title="Create a Bucket">
      Bucket Drawer
    </Drawer>
  );
};

interface StateProps {
  isOpen: boolean;
}

const connected = connect((state: ApplicationState) => ({
  isOpen: state.bucketDrawer.isOpen
}));

const enhanced = compose(
  connected,
  bucketContainer
);
export default enhanced(BucketDrawer);
