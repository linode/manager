import { updateLinode as _updateLinode } from 'src/services/linodes';
import { createRequestThunk } from "../store.helpers";
import { requestUpdateLinodeActions } from "./linodes.actions";

export const updateLinode = createRequestThunk(
  requestUpdateLinodeActions,
  ({ linodeId, ...data }) => _updateLinode(linodeId, data),

)
