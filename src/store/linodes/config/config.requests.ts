/**
 * @note Make sure you add the linode_id to the config object!`
 */

import {
  createLinodeConfig as _createLinodeConfig,
  deleteLinodeConfig as _deleteLinodeConfig,
  getLinodeConfig as _getLinodeConfig,
  getLinodeConfigs as _getLinodeConfigs,
  updateLinodeConfig as _updateLinodeConfig
} from 'src/services/linodes';
import { createRequestThunk } from 'src/store/store.helpers';
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import {
  createLinodeConfigActions,
  deleteLinodeConfigActions,
  getAllLinodeConfigsActions,
  GetAllLinodeConfigsParams,
  getLinodeConfigActions,
  getLinodeConfigsActions,
  updateLinodeConfigActions
} from './config.actions';
import { Entity } from './config.types';

const addLinodeIdToConfig = (linodeId: number) => (
  config: Linode.Config
): Entity => ({
  ...config,
  linode_id: linodeId
});

export const createLinodeConfig = createRequestThunk(
  createLinodeConfigActions,
  ({ linodeId, ...data }) =>
    _createLinodeConfig(linodeId, data).then(addLinodeIdToConfig(linodeId))
);

export const getLinodeConfigs = createRequestThunk(
  getLinodeConfigsActions,
  ({ linodeId }) =>
    _getLinodeConfigs(linodeId)
      .then(({ data }) => data)
      .then(configs => configs.map(addLinodeIdToConfig(linodeId)))
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

export const getAllLinodeConfigs: ThunkActionCreator<Promise<Entity[]>> = (
  params: GetAllLinodeConfigsParams
) => async dispatch => {
  const { linodeId } = params;
  const { started, done, failed } = getAllLinodeConfigsActions;
  dispatch(started(params));
  const req = getAll<Entity>((configParams?: any, filter?: any) =>
    _getLinodeConfigs(linodeId, configParams, filter)
  );

  try {
    const { data } = await req();
    dispatch(done({ params, result: data.map(addLinodeIdToConfig(linodeId)) }));
    return data;
  } catch (error) {
    dispatch(failed({ params, error }));
    throw error;
  }
};
