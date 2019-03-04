import actionCreatorFactory from 'typescript-fsa';

const actionBase = actionCreatorFactory('@@manager/create-linode');

export type CreateTypes =
  | 'One-Click Apps'
  | 'Community StackScripts'
  | 'Distrubutions'
  | 'Backups and My Images'
  | 'Clone from Existing Linode'
  | 'My StackScripts'
  | 'One-Click'
  | 'My Images';

export const handleChangeCreateType = actionBase<CreateTypes>('change-type');
