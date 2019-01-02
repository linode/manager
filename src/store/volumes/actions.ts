import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/volumes`);

const getVolumesRequest = actionCreator('request');

const getVolumesSuccess = actionCreator<Linode.Volume[]>('success');

const getVolumesFailure = actionCreator<Linode.ApiFieldError[]>('fail');

const addVolume = actionCreator<Linode.Volume>('add');

const updateVolume = actionCreator<Linode.Volume>('update');

const updateMultipleVolumes = actionCreator<Linode.Volume[]>('update_multiple')

const deleteVolume = actionCreator<number>('delete');

export const actions = {
  addVolume,
  updateVolume,
  updateMultipleVolumes,
  deleteVolume,
  getVolumesRequest,
  getVolumesSuccess,
  getVolumesFailure
};
