import { ActionCreator, MapStateToProps as _MapStateToProps } from "react-redux";
import { Action } from "redux";
import { ThunkAction, ThunkDispatch as _ThunkDispatch } from "redux-thunk";

export type ThunkResult<T> = ThunkAction<T, ApplicationState, undefined, Action>;

export type ThunkActionCreator<T> = ActionCreator<ThunkResult<T>>;

export type ThunkDispatch = _ThunkDispatch<ApplicationState, undefined, Action>

export type MapState<S, O> = _MapStateToProps<S, O, ApplicationState>;

export interface Entity { id: number | string }

type EntityMap<T> = Record<string, T>;

export interface EntityState<T extends Entity> {
  error?: Error;
  items: string[];
  itemsById: EntityMap<T>;
  lastUpdated: number;
  loading: boolean;
}
