import { LongviewClient } from '@linode/api-v4/lib/longview';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

import { GetAllData } from 'src/utilities/getAll';

export const actionCreator = actionCreatorFactory(`@@manager/longview`);

export const getLongviewClients = actionCreator.async<
  {
    filter?: Filter;
    params?: Params;
  },
  GetAllData<LongviewClient>,
  APIError[]
>(`get`);

export const createLongviewClient = actionCreator.async<
  {
    label?: string;
  },
  LongviewClient,
  APIError[]
>(`create`);

export const deleteLongviewClient = actionCreator.async<
  {
    id: number;
  },
  {},
  APIError[]
>(`delete`);

export const updateLongviewClient = actionCreator.async<
  {
    id: number;
    label: string;
  },
  LongviewClient,
  APIError[]
>(`update`);
