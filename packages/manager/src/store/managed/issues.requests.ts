import { getManagedIssues } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { requestManagedIssuesActions } from './issues.actions';

const _getAllIssues = getAll(getManagedIssues);
const getAllIssues = () => _getAllIssues().then(({ data }) => data);

export const requestManagedIssues = createRequestThunk(
  requestManagedIssuesActions,
  getAllIssues
);
