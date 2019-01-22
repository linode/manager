import { connect } from "react-redux";
import { updateLinode } from './linode.requests';
import { UpdateLinodeParams } from "./linodes.actions";

export interface LinodeActionsProps {
  linodeActions: {
    updateLinode: (params: UpdateLinodeParams) => Promise<Linode.Linode>,
  }
}

export const withLinodeActions = connect(undefined, {
  linodeActions: { updateLinode },
});
