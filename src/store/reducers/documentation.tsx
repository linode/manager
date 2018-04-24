import { Action } from 'redux';

const CLEAR = '@@manager/documentation/CLEAR';
const SET = '@@manager/documentation/SET';

interface ClearType extends Action {
  type: typeof CLEAR;
}

interface SetType extends Action {
  type: typeof SET;
  payload: Linode.Doc[];
}

export const clearDocs = (): ClearType => ({
  type: CLEAR,
});

export const setDocs = (docs: Linode.Doc[]): SetType => ({
  type: SET,
  payload: docs,
});

export const defaultState: Linode.Doc[] = [];

export default function documentation(state = defaultState, action: ClearType | SetType) {
  switch (action.type) {
    case CLEAR: return [];

    case SET: return action.payload;

    default:
      return state;
  }
}
