import { DatabaseType } from '@linode/api-v4/lib/databases';
import { APIError } from '@linode/api-v4/lib/types';
import { GetAllData } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/databases/types`);

export const getDatabaseTypesActions = actionCreator.async<
  {
    params?: any;
    filter?: any;
  },
  GetAllData<DatabaseType>,
  APIError[]
>(`get-all`);
