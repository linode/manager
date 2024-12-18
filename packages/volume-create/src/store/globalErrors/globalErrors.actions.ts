import { actionCreatorFactory } from 'typescript-fsa';

import { State } from './types';

const actionCreator = actionCreatorFactory('@@manager/globalErrors');

export const setErrors = actionCreator<Partial<State>>('/set');

export const clearErrors = actionCreator<Partial<State> | undefined>('/clear');
