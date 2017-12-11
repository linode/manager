import { actions } from '../generic/volumes';
import { fetch } from '../fetch';


export function detachVolume(volumeId) {
  return async function(dispatch) {
    await dispatch(fetch.post(`/volumes/${volumeId}/detach`));
    dispatch(actions.one({ linode_id: null }, volumeId));
  };
}

export function attachVolume(volumeId, linodeId, configId = null) {
  return async function(dispatch) {
    const data = {
      linode_id: parseInt(linodeId),
      config_id: (configId === null ? configId : parseInt(configId)),
    };

    if (!data.config_id) {
      delete data.config_id;
    }

    await dispatch(fetch.post(`/volumes/${volumeId}/attach`, data));
    dispatch(actions.one({ linode_id: linodeId }, volumeId));
  };
}

export function resizeVolume(volumeId, size) {
  return async function(dispatch) {
    await dispatch(fetch.post(`/volumes/${volumeId}/resize`, { size }));
    dispatch(actions.one({ size: size }, volumeId));
  };
}
