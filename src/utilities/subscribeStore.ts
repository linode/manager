import { throttle } from 'lodash';

export const loadState = () => {
  try {
    const state = localStorage.getItem('state');
    if (state === null) {
      return undefined;
    } else {
      return JSON.parse(state);
    }
  } catch {
    return undefined;
  }
};

const _saveState = (state: any) => {
  try {
    const stringifiedState = JSON.stringify(state);
    localStorage.setItem('state', stringifiedState);
  } catch {
    return;
  }
};

export const saveState = throttle(_saveState, 1000);
