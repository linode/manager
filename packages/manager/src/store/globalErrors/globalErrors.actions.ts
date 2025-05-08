import { actionCreatorFactory } from 'typescript-fsa';

import type { State } from './types';

export const actionCreator = actionCreatorFactory('@@manager/globalErrors');

export const setErrors = actionCreator<Partial<State>>('/set');

export const clearErrors = actionCreator<Partial<State> | undefined>('/clear');
