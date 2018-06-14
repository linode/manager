import { over, lensProp, filter } from 'ramda';

import { API_ROOT } from 'src/constants';
import Request, {
  setURL,
  setMethod,
  setParams,
  setXFilter,
} from './index';

type Page<T> = Linode.ResourcePage<T>;
type StackScript = Linode.StackScript.Response;

export const getStackscripts = (params?: any, filter?: any) =>
  Request<Page<StackScript>>(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  )
    .then(response => response.data);

export const getMyStackscripts = (params?: any) =>
  getStackscripts(params, { mine: true });

export const getLinodeStackscripts = (params?: any, filter?: any) =>
  getStackscripts(params, filter)
    .then(updateData(filterLinodeUser));

export const getCommunityStackscripts = (username: string) =>
  getStackscripts()
    .then(updateData(filterLinodeUser))
    .then(updateData(filterMine(username)));

const updateData = <T>(fn: (a: T[]) => T[]) => over(lensProp('data'), fn);

const filterLinodeUser = filter<Linode.StackScript.Response>(s => s.username !== 'Linode');

const filterMine = (username: string) =>
  filter<Linode.StackScript.Response>(s => s.username !== username);
