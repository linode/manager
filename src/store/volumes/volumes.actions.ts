import { Dispatch } from "redux";
import { ThunkAction } from 'redux-thunk';
import actionCreatorFactory from 'typescript-fsa';

import { getVolume, getVolumes } from 'src/services/volumes';
import { getAll } from "src/utilities/getAll";

type State = ApplicationState['__resources']['volumes'];

export const actionCreator = actionCreatorFactory(`@@manager/volumes`);

const getVolumesRequest = actionCreator('request');

const getVolumesSuccess = actionCreator<Linode.Volume[]>('success');

const getVolumesFailure = actionCreator<Linode.ApiFieldError[]>('fail');

const upsertVolume = actionCreator<Linode.Volume>('upsert');

const updateMultipleVolumes = actionCreator<Linode.Volume[]>('update_multiple')

const deleteVolume = actionCreator<number>('delete');

/** Async */

const requestVolumes = () => (dispatch: Dispatch<State>) => {
  dispatch(getVolumesRequest());

  return getAll<Linode.Volume>(getVolumes)()
    .then(response => response.data)
    .then((volumes) => {
      dispatch(getVolumesSuccess(volumes));
      return volumes;
    })
    .catch((err) => {
      dispatch(getVolumesFailure(err));
    });
};

type RequestLinodeForStoreThunk = (id: number) => ThunkAction<void, ApplicationState, undefined>;
const requestVolumeForStore: RequestLinodeForStoreThunk = (id) => (dispatch) =>
  getVolume(id)
    .then(volume => {
      return dispatch(upsertVolume(volume))
    })

export default {
  upsertVolume,
  updateMultipleVolumes,
  deleteVolume,
  getVolumesRequest,
  getVolumesSuccess,
  getVolumesFailure,
  requestVolumeForStore,
  requestVolumes,
};
