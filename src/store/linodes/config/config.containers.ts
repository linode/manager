import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  CreateLinodeConfigRequest,
  DeleteLinodeConfigRequest,
  GetAllLinodeConfigsRequest,
  GetLinodeConfigRequest,
  GetLinodeConfigsRequest,
  UpdateLinodeConfigRequest
} from './config.actions';
import * as actions from './config.requests';

interface Actions {
  getLinodeConfigs: GetLinodeConfigsRequest;
  getAllLinodeConfigs: GetAllLinodeConfigsRequest;
  createLinodeConfig: CreateLinodeConfigRequest;
  getLinodeConfig: GetLinodeConfigRequest;
  updateLinodeConfig: UpdateLinodeConfigRequest;
  deleteLinodeConfig: DeleteLinodeConfigRequest;
}

export interface WithLinodeConfigActions {
  linodeConfigActions: Actions;
}

export const withLinodeConfigActions = connect(
  undefined,
  dispatch => ({ linodeConfigActions: bindActionCreators(actions, dispatch) })
);
