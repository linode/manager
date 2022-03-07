import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { ApplicationState } from 'src/store';

export type Dispatch = ThunkDispatch<ApplicationState, undefined, AnyAction>;
