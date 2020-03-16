import { isTestEntity, getAll, deleteById, makeTestLabel } from './common';

const relativeApiPath = 'volumes';

export const makeVolumeLabel = makeTestLabel;

export const getVolumes = () => getAll(relativeApiPath);

export const deleteVolumeById = id => deleteById(relativeApiPath, id);

export const deleteAllTestVolumes = () => {
  getVolumes().then(resp => {
    resp.body.data.forEach(vol => {
      if (isTestEntity(vol)) deleteVolumeById(vol.id);
    });
  });
};
