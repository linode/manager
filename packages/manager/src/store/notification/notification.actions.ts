import { Notification } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';

export interface Action {
  type: string;
  error?: APIError[];
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

export const handleError: ActionCreator = (error: APIError[]) => ({
  type: ERROR,
  error
});

export const handleSuccess: ActionCreator = (data: Notification[]) => ({
  type: SUCCESS,
  data
});

export const handleUpdate: ActionCreator = (data: Notification[]) => ({
  type: UPDATE,
  data
});
