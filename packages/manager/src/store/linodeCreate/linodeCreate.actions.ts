import actionCreatorFactory from 'typescript-fsa';

const actionBase = actionCreatorFactory('@@manager/create-linode');

export type CreateTypes =
  | 'fromApp'
  | 'fromBackup'
  | 'fromImage'
  | 'fromLinode'
  | 'fromStackScript';

export const handleChangeCreateType = actionBase<CreateTypes>('change-type');
