import { getDeprecatedLinodeTypes, getLinodeTypes, LinodeType } from 'linode-js-sdk/lib/linodes'
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import { getLinodeTypesActions } from './linodeType.actions';

type RequesTypesThunk = ThunkActionCreator<Promise<LinodeType[]>>;
export const requestTypes: RequesTypesThunk = () => dispatch => {
  dispatch(getLinodeTypesActions.started());
  return Promise.all([
    getAll<LinodeType>(getLinodeTypes)(),
    getAll<LinodeType>(getDeprecatedLinodeTypes)()
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
