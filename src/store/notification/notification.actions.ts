export interface Action {
  type: string;
  error?: Linode.ApiFieldError[];
  data?: any;
}

type ActionCreator = (...args: any[]) => Action;

// ACTIONS
export const LOAD = '@manager/notifications/LOAD';
export const ERROR = '@manager/notifications/ERROR';
export const SUCCESS = '@manager/notifications/SUCCESS';
export const UPDATE = '@manager/notifications/UPDATE';

// ACTION CREATORS
export const startRequest: ActionCreator = () => ({ type: LOAD });

export const handleError: ActionCreator = (error: Linode.ApiFieldError[]) => ({
  type: ERROR,
  error
});

export const handleSuccess: ActionCreator = (data: Linode.Notification[]) => ({
  type: SUCCESS,
  data
});

export const handleUpdate: ActionCreator = (data: Linode.Notification[]) => ({
  type: UPDATE,
  data
});
