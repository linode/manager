import { fetch } from '~/fetch';
import { pushPath } from 'redux-simple-router'

export const CHANGE_SOURCE_TAB = "@@ui@@linode-creation/CHANGE_SOURCE_TAB";
export const TOGGLE_ALL_PLANS = "@@ui@@linode-creation/TOGGLE_ALL_PLANS";
export const SELECT_SOURCE = "@@ui@@linode-creation/SELECT_SOURCE";
export const SELECT_DATACENTER = "@@ui@@linode-creation/SELECT_DATACENTER";
export const SELECT_SERVICE = "@@ui@@linode-creation/SELECT_SERVICE";
export const SET_LABEL = "@@ui@@linode-creation/SET_LABEL";
export const GENERATE_PASSWORD = "@@ui@@linode-creation/GENERATE_PASSWORD";
export const TOGGLE_SHOW_PASSWORD = "@@ui@@linode-creation/TOGGLE_SHOW_PASSWORD";
export const TOGGLE_CREATING = "@@ui@@linode-creation/TOGGLE_CREATING";
export const CLEAR_FORM = "@@ui@@linode-creation/CLEAR_FORM";

import { UPDATE_LINODE, updateLinodeUntil } from '~/actions/api/linodes';

export function changeSourceTab(tab) {
  return { type: CHANGE_SOURCE_TAB, tab };
}

export function selectSource(source) {
  return { type: SELECT_SOURCE, source };
}

export function selectDatacenter(datacenter) {
  return { type: SELECT_DATACENTER, datacenter };
}

export function selectService(service) {
  return { type: SELECT_SERVICE, service };
}

export function toggleAllPlans() {
  return { type: TOGGLE_ALL_PLANS };
}

export function setLabel(label) {
  return { type: SET_LABEL, label };
}

export function generatePassword() {
  return { type: GENERATE_PASSWORD };
}

export function toggleShowPassword() {
  return { type: TOGGLE_SHOW_PASSWORD };
}

export function createLinode() {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    const ui = state.linodes.create;
    dispatch({ type: TOGGLE_CREATING });
    let data = {
      label: ui.label,
      datacenter: ui.datacenter,
      service: ui.service,
      source: ui.source,
      root_pass: ui.password
    };
    const response = await fetch(token, `/linodes`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await response.json();
    // TODO: Error handling
    dispatch({ type: UPDATE_LINODE, linode: json });
    dispatch(pushPath(`/linodes/${json.id}`));
    dispatch({ type: TOGGLE_CREATING });
    dispatch({ type: CLEAR_FORM });
    dispatch(updateLinodeUntil(json.id,
      l => l.state !== "provisioning"));
  };
}
