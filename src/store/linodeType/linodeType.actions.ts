import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/types`);

export const getLinodeTypesActions = actionCreator.async<
  void,
  Linode.LinodeType[],
  Linode.ApiFieldError[]
>(`request`);
