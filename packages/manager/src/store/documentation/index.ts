import { Action, Reducer } from 'redux';

export type State = Linode.Doc[];

interface ClearType extends Action {
  type: typeof CLEAR;
}

interface SetType extends Action {
  type: typeof SET;
  payload: Linode.Doc[];
}

const CLEAR = '@@manager/documentation/CLEAR';
const SET = '@@manager/documentation/SET';

export const clearDocs = (): ClearType => ({
  type: CLEAR
});

export const setDocs = (docs: Linode.Doc[]): SetType => ({
  type: SET,
  payload: docs
});

export const defaultState: Linode.Doc[] = [];

const documentation: Reducer<State> = (
  state = defaultState,
  action: ClearType | SetType
) => {
  switch (action.type) {
    case CLEAR:
      return [];

    case SET:
      return action.payload;

    default:
      return state;
  }
};

export default documentation;
