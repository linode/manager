import {
  getDeprecatedLinodeTypes,
  getLinodeTypes,
  LinodeType
} from 'linode-js-sdk/lib/linodes';
import cachedTypes from 'src/cachedData/types.json';
import cachedDeprecatedTypes from 'src/cachedData/typesLegacy.json';
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import { getLinodeTypesActions } from './linodeType.actions';

type RequestTypesThunk = ThunkActionCreator<Promise<LinodeType[]>>;
export const requestTypes: RequestTypesThunk = () => dispatch => {
  /**
   * This is a semi-static endpoint, so use cached data
   * if it's available.
   */
  if (cachedTypes.data && cachedDeprecatedTypes.data) {
    return dispatch(
      getLinodeTypesActions.done({
        result: [...cachedTypes.data, ...cachedDeprecatedTypes.data]
      })
    );
  }
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
