import { Params, Filter, ResourcePage } from 'src/types';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

export const getFilters = (params: Params, filters: Filter, url: string) =>
  Request<ResourcePage<{ [key: string]: unknown }>>(
    setURL(url),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );
