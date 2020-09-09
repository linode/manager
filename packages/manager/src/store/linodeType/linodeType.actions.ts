import { LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/types`);

export const getLinodeTypesActions = actionCreator.async<
  void,
  LinodeType[],
  APIError[]
>(`request`);

export const getLinodeTypeActions = actionCreator.async<
  { typeId: string; isShadowPlan?: boolean },
  LinodeType,
  APIError[]
>(`request-one`);
