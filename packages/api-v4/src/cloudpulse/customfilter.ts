import { Params, Filter, ResourcePage } from 'src/types';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

/**
 * @param params - The params of the api call, contains information related to pagination
 * @param filters - The xFilters that needs to applied in the API
 * @param url - The URL that is going to be called
 * @returns - The filters loaded from the API as JSON response, eg list of db engines, node types, regions etc.,
 */
export const getFilters = (params: Params, filters: Filter, url: string) =>
  Request<ResourcePage<{ [key: string]: unknown }>>(
    setURL(url),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );
