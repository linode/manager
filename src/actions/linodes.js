import fetch from '../fetch';

export const UPDATE_LINODES = "@@linodes/UPDATE_LINODES";
export const UPDATE_LINODE = "@@linodes/UPDATE_LINODE";
export const LINODE_PENDING = "@@linodes/LINODE_PENDING";

function shouldUpdate(state) {
  if (state.localPage !== state.remotePage) {
    return true;
  }
  // TODO: Other conditions?
  return false;
}

export function updateLinodesIfNecessary() {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, "/linodes");
    const json = await response.json();
    dispatch({ type: UPDATE_LINODES, response: json });
  };
}

export function updateLinode(id) {
  return async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}`);
    const json = await response.json();
    dispatch({ type: UPDATE_LINODE, response: json });
  };
}

export function updateLinodeUntil(id, test, timeout=3000) {
  const update = async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}`);
    const json = await response.json();
    dispatch({ type: UPDATE_LINODE, json });
    if (!test(json)) {
      setTimeout(() => update(dispatch, getState), timeout);
    }
  };
  return update;
}

export function updateJobUntil(linodeId, jobId, test, done=null, timeout=3000) {
  const update = async (dispatch, getState) => {
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${linodeId}/jobs/${jobId}`);
    const json = await response.json();
    if (!test(json)) {
      setTimeout(() => update(dispatch, getState), timeout);
    } else {
      if (done !== null) {
        done(json);
      }
    }
  };
  return update;
}

async function monitor(id, json, dispatch) {
  dispatch(updateJobUntil(id, json.id, (j) => j.finished !== null, () => {
    dispatch(updateLinode(id));
    dispatch({ type: LINODE_PENDING, linode: { id }, pending: false });
  }));
}

export function powerOnLinode(id) {
  return async (dispatch, getState) => {
    dispatch({ type: LINODE_PENDING, linode: { id }, pending: true });
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}/boot`, { method: "POST" });
    const json = await response.json();
    monitor(id, json, dispatch);
  };
}

export function powerOffLinode(id) {
  return async (dispatch, getState) => {
    dispatch({ type: LINODE_PENDING, linode: { id }, pending: true });
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}/shutdown`, { method: "POST" });
    const json = await response.json();
    monitor(id, json, dispatch);
  };
}

export function rebootLinode(id) {
  return async (dispatch, getState) => {
    dispatch({ type: LINODE_PENDING, linode: { id }, pending: true });
    const { token } = getState().authentication;
    const response = await fetch(token, `/linodes/${id}/reboot`, { method: "POST" });
    const json = await response.json();
    monitor(id, json.jobs[1], dispatch);
  };
}
