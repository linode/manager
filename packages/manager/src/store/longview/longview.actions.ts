import { LongviewClient } from '@linode/api-v4/lib/longview';
import { Filter, Params } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

import { FormattedAPIError } from 'src/types/FormattedAPIError';
import { GetAllData } from 'src/utilities/getAll';

export const actionCreator = actionCreatorFactory(`@@manager/longview`);

export const getLongviewClients = actionCreator.async<
  {
    filter?: Filter;
    params?: Params;
  },
  GetAllData<LongviewClient>,
  FormattedAPIError[]
>(`get`);

export const createLongviewClient = actionCreator.async<
  {
    label?: string;
  },
  LongviewClient,
  FormattedAPIError[]
>(`create`);

export const deleteLongviewClient = actionCreator.async<
  {
    id: number;
  },
  {},
  FormattedAPIError[]
>(`delete`);

export const updateLongviewClient = actionCreator.async<
  {
    id: number;
    label: string;
  },
  LongviewClient,
  FormattedAPIError[]
>(`update`);
