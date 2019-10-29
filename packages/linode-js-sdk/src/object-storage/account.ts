import { BETA_API_ROOT } from 'src/constants';
import Request, { setMethod, setURL } from '../request';

/**
 * cancelObjectStorage
 *
 * Cancels Object Storage service
 */
export const cancelObjectStorage = () =>
  Request<{}>(
    setMethod('POST'),
    setURL(`${BETA_API_ROOT}/object-storage/cancel`)
  ).then(response => response.data);
