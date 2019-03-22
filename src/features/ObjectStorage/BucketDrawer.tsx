import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import Drawer from 'src/components/Drawer';
import bucketDrawerContainer, {
  DispatchProps,
  StateProps
} from 'src/containers/bucketDrawer.container';
import CreateBucketForm from './CreateBucketForm';

type CombinedProps = StateProps & DispatchProps & InjectedNotistackProps;

export const BucketDrawer: React.StatelessComponent<CombinedProps> = props => {
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

const enhanced = compose(
  withSnackbar,
  bucketDrawerContainer
);
export default enhanced(BucketDrawer);
