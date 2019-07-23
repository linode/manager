import { getDeprecatedLinodeTypes, getLinodeTypes } from 'src/services/linodes';
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import { getLinodeTypesActions } from './linodeType.actions';

type RequesTypesThunk = ThunkActionCreator<Promise<Linode.LinodeType[]>>;
export const requestTypes: RequesTypesThunk = () => dispatch => {
  dispatch(getLinodeTypesActions.started());
  return Promise.all([
    getAll<Linode.LinodeType>(getLinodeTypes)(),
    getAll<Linode.LinodeType>(getDeprecatedLinodeTypes)()
  ])
    .then(([{ data: types }, { data: legacyTypes }]) => [
      ...types,
      ...legacyTypes
    ])
    .then(allTypes => {
      dispatch(getLinodeTypesActions.done({ result: allTypes }));
      return allTypes;
    })
    .catch(error => {
      dispatch(getLinodeTypesActions.failed({ error }));
      return error;
    });
};
