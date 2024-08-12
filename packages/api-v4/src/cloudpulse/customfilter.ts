import { Params, Filter, ResourcePage } from 'src/types';
import Request, { setMethod, setParams, setURL, setXFilter } from '../request';

/**
 * This function makes an API-V4 call based on given URL and returns the response
 * @param params - The params of the api call, contains information related to pagination
 * @param filters - The xFilters that needs to applied in the API
 * @param url - The URL that is going to be called
 * @returns - The filters loaded from the API
 */
export const getFilters = (params: Params, filters: Filter, url: string) =>
  Request<ResourcePage<{ [key: string]: unknown }>>( // since our API's can be anything like list of db engines, node types, region etc., come up with this structure
    setURL(url),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );
