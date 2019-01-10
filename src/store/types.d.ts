import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch as _ThunkDispatch } from 'redux-thunk';

export type ThunkResult<R, A = Action<any>> = ThunkAction<R, ApplicationState, undefined, Action<any>>;

export type RequestThunk<R> = ActionCreator<ThunkResult<Promise<R>>>;

export type ThunkDispatch = _ThunkDispatch<ApplicationState, undefined, Action<any>>;
