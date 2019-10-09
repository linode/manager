import { API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from 'src/request';
import { ResourcePage } from '../types';
import { longviewClientCreate } from './longview.schema';
import { LongviewClient } from './types';

export const createLongviewClient = (label: string) => {
  return Request<LongviewClient>(
    setURL(`${API_ROOT}/longview/clients`),
    setData(
      {
        label
      },
      longviewClientCreate
    ),
    setMethod('POST')
  ).then(response => response.data);
};

export const getLongviewClients = (params?: any, filter?: any) =>
  Request<ResourcePage<LongviewClient>>(
    setURL(`${API_ROOT}/longview/clients`),
    setParams(params),
    setXFilter(filter),
    setMethod('GET')
  ).then(response => response.data);
