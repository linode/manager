import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Drawer from 'src/components/Drawer';
import bucketContainer, {
  DispatchProps as BucketContainerDispatchProps
} from 'src/containers/bucket.container';
import { ApplicationState } from 'src/store';
import CreateBucketForm from './CreateBucketForm';

type CombinedProps = BucketContainerDispatchProps &
  InjectedNotistackProps &
  StateProps;
const BucketDrawer: React.StatelessComponent<CombinedProps> = props => {
  const { isOpen, closeBucketDrawer, enqueueSnackbar } = props;

  const onSuccess = (bucketLabel: string) => {
    closeBucketDrawer();
    enqueueSnackbar(`Bucket ${bucketLabel} has been created.`, {
      variant: 'success'
    });
  };

  return (
    <Drawer onClose={closeBucketDrawer} open={isOpen} title="Create a Bucket">
      <CreateBucketForm onClose={closeBucketDrawer} onSuccess={onSuccess} />
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
  withSnackbar,
  bucketContainer
);
export default enhanced(BucketDrawer);
