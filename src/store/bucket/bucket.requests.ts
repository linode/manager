import { getBuckets as _getBuckets } from 'src/services/objectStorage/buckets';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getAllBucketsActions } from './bucket.actions';

/*
 * Get All Buckets
 */
const _getAll = getAll<Linode.Bucket>(_getBuckets);

const getAllBucketsRequest = () => _getAll().then(({ data }) => data);

export const getAllBuckets = createRequestThunk(
  getAllBucketsActions,
  getAllBucketsRequest
);
