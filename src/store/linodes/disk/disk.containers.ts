import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  CreateLinodeDiskRequest,
  DeleteLinodeDiskRequest,
  GetAllLinodeDisksRequest,
  GetLinodeDiskRequest,
  GetLinodeDisksRequest,
  ResizeLinodeDiskRequest,
  UpdateLinodeDiskRequest
} from './disk.actions';
import * as actions from './disk.requests';

interface Actions {
  getLinodeDisks: GetLinodeDisksRequest;
  getAllLinodeDisks: GetAllLinodeDisksRequest;
  createLinodeDisk: CreateLinodeDiskRequest;
  getLinodeDisk: GetLinodeDiskRequest;
  updateLinodeDisk: UpdateLinodeDiskRequest;
  deleteLinodeDisk: DeleteLinodeDiskRequest;
  resizeLinodeDisk: ResizeLinodeDiskRequest;
}

export interface WithLinodeDiskActions {
  linodeDiskActions: Actions;
}

export const withLinodeDiskActions = connect(
  undefined,
  dispatch => ({ linodeDiskActions: bindActionCreators(actions, dispatch) })
);
