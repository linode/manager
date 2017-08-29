import { thunkFetch } from './apiActionReducerGenerator';
import { actions } from './configs/volumes';


export function detachVolume(volumeId) {
  return async (dispatch) => {
    await dispatch(thunkFetch.post(`/linode/volumes/${volumeId}/detach`));
    dispatch(actions.one({ linode_id: null }, volumeId));
  };
}

export function attachVolume(volumeId, linodeId, configId = null) {
  return async (dispatch) => {
    const data = {
      linode_id: linodeId,
      config_id: configId,
    };

    await dispatch(thunkFetch.post(`/linode/volumes/${volumeId}/attach`, data));
    dispatch(actions.one({ linode_id: linodeId }, volumeId));
  };
}
