import { thunkFetch } from './apiActionReducerGenerator';
import { actions } from './configs/volumes';


export function detachVolume(volumeId) {
  return async function(dispatch) {
    await dispatch(thunkFetch.post(`/linode/volumes/${volumeId}/detach`));
    dispatch(actions.one({ linode_id: null }, volumeId));
  };
}

export function attachVolume(volumeId, linodeId, configId = null) {
  return async function(dispatch) {
    const data = {
      linode_id: linodeId,
      config_id: configId,
    };

    await dispatch(thunkFetch.post(`/linode/volumes/${volumeId}/attach`, data));
    dispatch(actions.one({ linode_id: linodeId }, volumeId));
  };
}

export function resizeVolume(volumeId, size) {
  return async function(dispatch) {
    await dispatch(thunkFetch.post(`/linode/volumes/${volumeId}/resize`, { size }));
    dispatch(actions.one({ size: size }, volumeId));
  }
}
