import { LinodeType } from 'linode-js-sdk/lib/linodes';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/types`);

export const getLinodeTypesActions = actionCreator.async<
  void,
  LinodeType[],
  Linode.ApiFieldError[]
>(`request`);
