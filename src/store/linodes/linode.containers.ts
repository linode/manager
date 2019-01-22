import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createLinode, deleteLinode, updateLinode } from './linode.requests';
import { CreateLinodeParams, DeleteLinodeParams, UpdateLinodeParams } from "./linodes.actions";

export interface LinodeActionsProps {
  linodeActions: {
    createLinode: (params: CreateLinodeParams) => Promise<Linode.Linode>,
    deleteLinode: (params: DeleteLinodeParams) => Promise<void>,
    updateLinode: (params: UpdateLinodeParams) => Promise<Linode.Linode>,
  }
}

export const withLinodeActions = connect(undefined, (dispatch) => ({
  linodeActions: bindActionCreators({ createLinode, deleteLinode, updateLinode }, dispatch),
}));
