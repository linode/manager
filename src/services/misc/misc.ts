import { API_ROOT } from 'src/constants';

import Request, { setMethod, setURL } from '../index';

type Page<T> = Linode.ResourcePage<T>;
type Region = Linode.Region;

export const getRegions = () => Request<Page<Region>>(
  setURL(`${API_ROOT}/regions`),
  setMethod('GET'),
)
  .then(response => response.data);
