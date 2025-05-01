import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { ApplicationState } from 'src/store';

export type Dispatch = ThunkDispatch<ApplicationState, undefined, AnyAction>;
