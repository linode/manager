import { Dispatch } from "redux";
import { ThunkAction } from 'redux-thunk';

import { getVolume, getVolumes } from 'src/services/volumes';
import { getAll } from "src/utilities/getAll";

import { actions } from './actions';

type State = ApplicationState['volumes'];

const requestVolumes = () => (dispatch: Dispatch<State>) => {
  dispatch(actions.getVolumesRequest());

  return getAll<Linode.Volume>(getVolumes)()
    .then(response => response.data)
    .then((volumes) => {
      dispatch(actions.getVolumesSuccess(volumes));
      return volumes;
    })
    .catch((err) => {
      dispatch(actions.getVolumesFailure(err));
    });
};


type RequestLinodeForStoreThunk = (id: number) => ThunkAction<void, ApplicationState, undefined>;
const requestVolumeForStore: RequestLinodeForStoreThunk = (id) => (dispatch, getState) => {
  const { results } = getState().volumes;

  getVolume(id)
    .then(volume => {
      if (results.includes(id)) {
        return dispatch(actions.updateVolume(volume));
      }
      return dispatch(actions.addVolume(volume))
    })

};

export const async = { requestVolumes, requestVolumeForStore }