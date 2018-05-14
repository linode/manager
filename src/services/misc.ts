import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod } from './index';

type GetRegionsPage = Promise<Linode.ResourcePage<Linode.Region>>;
export const getRegions = (): GetRegionsPage => Request(
  setURL(`${API_ROOT}/regions`),
  setMethod('GET'),
)
  .then(response => response.data);
