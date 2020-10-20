import { DatabaseType } from '@linode/api-v4/lib/databases/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/vlans/vlans.reducer';
import { getAllMySQLTypes } from 'src/store/databases/types.requests';
import { Dispatch } from './types';

export interface DatabaseTypesProps {
  databaseTypes: State;
  requestDatabaseTypes: (params?: any, filter?: any) => Promise<DatabaseType[]>;
}

export const useDatabaseTypes = () => {
  const dispatch: Dispatch = useDispatch();
  const databaseTypes = useSelector(
    (state: ApplicationState) => state.__resources.databaseTypes
  );
  const requestDatabaseTypes = (params?: any, filter?: any) =>
    dispatch(getAllMySQLTypes({ params, filter }));

  return { databaseTypes, requestDatabaseTypes };
};

export default useDatabaseTypes;
