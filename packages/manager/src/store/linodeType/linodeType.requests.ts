import {
  getDeprecatedLinodeTypes,
  getLinodeTypes,
  LinodeType
} from '@linode/api-v4/lib/linodes';
import cachedTypes from 'src/cachedData/types.json';
import cachedDeprecatedTypes from 'src/cachedData/typesLegacy.json';
import { isProdAPI } from 'src/constants';
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import { getLinodeTypesActions } from './linodeType.actions';

type RequestTypesThunk = ThunkActionCreator<Promise<LinodeType[]>>;
export const requestTypes: RequestTypesThunk = () => dispatch => {
  /**
   * This is a semi-static endpoint, so use cached data
   * if it's available.
   *
   * NOTE: We don't rely on cached data in non-production environments,
   * since it may not match dev/staging API data.
   */
  if (isProdAPI && cachedTypes.data && cachedDeprecatedTypes.data) {
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
