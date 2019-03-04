import actionCreatorFactory from 'typescript-fsa';

const actionBase = actionCreatorFactory('@@manager/create-linode');

export type CreateTypes =
  | 'fromApp'
  | 'fromStackScript'
  | 'fromImage'
  | 'fromBackup'
  | 'fromLinode';

export const handleChangeCreateType = actionBase<CreateTypes>('change-type');
