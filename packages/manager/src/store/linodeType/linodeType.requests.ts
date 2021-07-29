import {
  getDeprecatedLinodeTypes,
  getLinodeTypes,
  getType,
  LinodeType,
} from '@linode/api-v4/lib/linodes';
import { ThunkActionCreator, ThunkDispatch } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers.tmp';
import {
  getLinodeTypeActions,
  getLinodeTypesActions,
} from './linodeType.actions';

type RequestTypesThunk = ThunkActionCreator<Promise<LinodeType[]>>;
export const requestTypes: RequestTypesThunk = () => (
  dispatch: ThunkDispatch
) => {
  dispatch(getLinodeTypesActions.started());
  return Promise.all([
    getAll<LinodeType>(getLinodeTypes)(),
    getAll<LinodeType>(getDeprecatedLinodeTypes)(),
  ])
    .then(([{ data: types }, { data: legacyTypes }]) => [
      ...types,
      ...legacyTypes,
    ])
    .then((allTypes) => {
      dispatch(getLinodeTypesActions.done({ result: allTypes }));
      return allTypes;
    })
    .catch((error) => {
      dispatch(getLinodeTypesActions.failed({ error }));
      return error;
    });
};

export const requestLinodeType = createRequestThunk(
  getLinodeTypeActions,
  ({ typeId }) => getType(typeId)
);
