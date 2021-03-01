import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ApplicationState } from 'src/store';
import {
  closeBucketDrawer,
  openBucketDrawer,
} from 'src/store/bucketDrawer/bucketDrawer.actions';

export interface StateProps {
  isOpen: boolean;
}

export interface DispatchProps {
  openBucketDrawer: () => void;
  closeBucketDrawer: () => void;
}

const mapStateToProps = (state: ApplicationState) => ({
  isOpen: state.bucketDrawer.isOpen,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  openBucketDrawer: () => dispatch(openBucketDrawer()),
  closeBucketDrawer: () => dispatch(closeBucketDrawer()),
});

export default connect(mapStateToProps, mapDispatchToProps);
