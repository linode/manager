import { connect } from "react-redux";
import { ThunkDispatch } from "../types";
import { createLinode, deleteLinode, updateLinode } from './linode.requests';
import { CreateLinodeParams, DeleteLinodeParams, UpdateLinodeParams } from "./linodes.actions";

export interface LinodeActionsProps {
  linodeActions: {
    createLinode: (params: CreateLinodeParams) => Promise<Linode.Linode>,
    deleteLinode: (params: DeleteLinodeParams) => Promise<void>,
    updateLinode: (params: UpdateLinodeParams) => Promise<Linode.Linode>,
  }
}

export const withLinodeActions = connect(undefined, (dispatch: ThunkDispatch) => ({
  linodeActions: {
    createLinode: (parmas: CreateLinodeParams) => dispatch(createLinode(parmas)),
    deleteLinode: (parmas: DeleteLinodeParams) => dispatch(deleteLinode(parmas)),
    updateLinode: (parmas: UpdateLinodeParams) => dispatch(updateLinode(parmas)),
  },
}));
