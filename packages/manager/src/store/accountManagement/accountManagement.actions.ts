import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/accountManagement`);

export const setLargeAccount = actionCreator<boolean>(`set-large-account`);
