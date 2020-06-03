/**
 * @note Make sure you add the linode_id to the config object!`
 */

import {
  Config,
  createLinodeConfig as _createLinodeConfig,
  deleteLinodeConfig as _deleteLinodeConfig,
  getLinodeConfig as _getLinodeConfig,
  getLinodeConfigs as _getLinodeConfigs,
  updateLinodeConfig as _updateLinodeConfig
} from '@linode/api-v4/lib/linodes';
import { createRequestThunk } from 'src/store/store.helpers';
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import {
  createLinodeConfigActions,
  deleteLinodeConfigActions,
  getAllLinodeConfigsActions,
  GetAllLinodeConfigsParams,
  getLinodeConfigActions,
  getLinodeConfigsPageActions,
  updateLinodeConfigActions
} from './config.actions';
import { Entity } from './config.types';

const addLinodeIdToConfig = (linodeId: number) => (config: Config): Entity => ({
  ...config,
  linode_id: linodeId
});

export const createLinodeConfig = createRequestThunk(
  createLinodeConfigActions,
  ({ linodeId, ...data }) =>
    _createLinodeConfig(linodeId, data).then(addLinodeIdToConfig(linodeId))
);

export const getLinodeConfigs = createRequestThunk(
  getLinodeConfigsPageActions,
  ({ linodeId }) =>
    _getLinodeConfigs(linodeId).then(response => ({
      data: response.data.map(addLinodeIdToConfig(linodeId)),
      results: response.results
    }))
);

export const getLinodeConfig = createRequestThunk(
  getLinodeConfigActions,
  ({ linodeId, configId }) =>
    _getLinodeConfig(linodeId, configId).then(addLinodeIdToConfig(linodeId))
);

export const updateLinodeConfig = createRequestThunk(
  updateLinodeConfigActions,
  ({ linodeId, configId, ...data }) =>
    _updateLinodeConfig(linodeId, configId, data).then(
      addLinodeIdToConfig(linodeId)
    )
);

export const deleteLinodeConfig = createRequestThunk(
  deleteLinodeConfigActions,
  ({ linodeId, configId }) => _deleteLinodeConfig(linodeId, configId)
);

export const getAllLinodeConfigs: ThunkActionCreator<
  Promise<Entity[]>,
  GetAllLinodeConfigsParams
> = params => async dispatch => {
  const { linodeId } = params;
  const { started, done, failed } = getAllLinodeConfigsActions;
  dispatch(started(params));
  const req = getAll<Entity>((configParams?: any, filter?: any) =>
    _getLinodeConfigs(linodeId, configParams, filter)
  );

  try {
    const response = await req();
    dispatch(
      done({
        params,
        result: {
          data: response.data.map(addLinodeIdToConfig(linodeId)),
          results: response.results
        }
      })
    );
    return response.data;
  } catch (error) {
    dispatch(failed({ params, error }));
    return error;
  }
};
