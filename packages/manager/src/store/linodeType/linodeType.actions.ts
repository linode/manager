import { LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory(`@@manager/types`);

export const getLinodeTypesActions = actionCreator.async<
  void,
  LinodeType[],
  APIError[]
>(`request`);

export interface GetLinodeTypeParams {
  typeId: string;
  isShadowPlan?: boolean;
}
export const getLinodeTypeActions = actionCreator.async<
  GetLinodeTypeParams,
  LinodeType,
  APIError[]
>(`request-one`);
