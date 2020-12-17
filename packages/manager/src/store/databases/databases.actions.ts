import {
  CreateDatabasePayload,
  Database,
  UpdateDatabasePayload
} from '@linode/api-v4/lib/databases';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/databases`);

export const getDatabasesActions = actionCreator.async<
  {
    params?: any;
    filter?: any;
  },
  GetAllData<Database>,
  APIError[]
>(`get-all`);

export const createDatabaseActions = actionCreator.async<
  CreateDatabasePayload,
  Database,
  APIError[]
>(`create`);

export const deleteDatabaseActions = actionCreator.async<
  { databaseID: number },
  {},
  APIError[]
>(`delete`);

export interface UpdateDatabaseParams extends UpdateDatabasePayload {
  databaseID: number;
}
export const updateDatabaseActions = actionCreator.async<
  UpdateDatabaseParams,
  Database,
  APIError[]
>(`update`);

export const resetPasswordActions = actionCreator.async<
  { databaseID: number; root_password: string },
  Database,
  APIError[]
>(`reset-password`);
