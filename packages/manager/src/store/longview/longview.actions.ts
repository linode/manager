import { LongviewClient } from '@linode/api-v4/lib/longview';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';

import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/longview`);

export const getLongviewClients = actionCreator.async<
  {
    params?: any;
    filter?: any;
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
