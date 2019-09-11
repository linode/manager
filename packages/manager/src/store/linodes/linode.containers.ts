import { Linode } from 'linode-js-sdk/lib/linodes'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  createLinode,
  deleteLinode,
  rebootLinode,
  updateLinode
} from './linode.requests';
import {
  CreateLinodeParams,
  DeleteLinodeParams,
  RebootLinodeParams,
  UpdateLinodeParams
} from './linodes.actions';

export interface Actions {
  createLinode: (params: CreateLinodeParams) => Promise<Linode>;
  deleteLinode: (params: DeleteLinodeParams) => Promise<void>;
  updateLinode: (params: UpdateLinodeParams) => Promise<Linode>;
  rebootLinode: (params: RebootLinodeParams) => Promise<void>;
}

export interface LinodeActionsProps {
  linodeActions: Actions;
}

export const withLinodeActions = connect(
  undefined,
  dispatch => ({
    linodeActions: bindActionCreators(
      { createLinode, deleteLinode, updateLinode, rebootLinode },
      dispatch
    )
  })
);
