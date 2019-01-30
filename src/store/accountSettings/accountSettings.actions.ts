// TYPES
export interface Action {
  type: string;
  error?: Error;
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const LOAD = '@manager/account/LOAD';
export const ERROR = '@manager/account/ERROR';
export const SUCCESS = '@manager/account/SUCCESS';
export const UPDATE = '@manager/account/UPDATE';
export const UPDATE_ERROR = '@manager/account/UPDATE_ERROR';

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Error) => ({
  type: ERROR,
  error
});

export const handleSuccess: ActionCreator = (data: Linode.AccountSettings) => ({
  type: SUCCESS,
  data
});

export const handleUpdate: ActionCreator = (data: Linode.AccountSettings) => ({
  type: UPDATE,
  data
});

export const handleUpdateError: ActionCreator = (error: Error) => ({
  type: UPDATE_ERROR,
  error
});
