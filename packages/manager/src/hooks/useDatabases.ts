import {
  CreateDatabasePayload,
  Database,
  UpdateDatabasePayload
} from '@linode/api-v4/lib/databases/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/vlans/vlans.reducer';
import {
  createDatabase as _create,
  deleteDatabase as _delete,
  getAllDatabases as _request,
  updateDatabase as _update
} from 'src/store/databases/databases.requests';
import { Dispatch } from './types';

export interface DatabasesProps {
  databases: State;
  requestDatabases: () => Promise<Database[]>;
  createDatabase: () => Promise<Database>;
  deleteDatabase: (databaseID: number) => Promise<{}>;
  updateDatabase: (databaseID: number) => Promise<Database>;
}

export const useDatabases = () => {
  const dispatch: Dispatch = useDispatch();
  const databases = useSelector(
    (state: ApplicationState) => state.__resources.databases
  );
  const requestDatabases = () => dispatch(_request({}));
  const createDatabase = (payload: CreateDatabasePayload) =>
    dispatch(_create(payload));
  const deleteDatabase = (databaseID: number) =>
    dispatch(_delete({ databaseID }));
  const updateDatabase = (
    databaseID: number,
    payload: UpdateDatabasePayload
  ) => {
    dispatch(_update({ databaseID, ...payload }));
  };

  return {
    databases,
    requestDatabases,
    createDatabase,
    deleteDatabase,
    updateDatabase
  };
};

export default useDatabases;
