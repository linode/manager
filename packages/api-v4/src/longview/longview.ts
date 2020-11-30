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
import {
  LongviewClient,
  LongviewSubscription,
  LongviewSubscriptionPayload,
  ActiveLongviewPlan
} from './types';

export const createLongviewClient = (label?: string) => {
  return Request<LongviewClient>(
    setURL(`${API_ROOT}/longview/clients`),
    setData(
      {
        label
      },
      longviewClientCreate
    ),
    setMethod('POST')
  );
};

export const getLongviewClients = (params?: any, filter?: any) =>
  Request<ResourcePage<LongviewClient>>(
    setURL(`${API_ROOT}/longview/clients`),
    setParams(params),
    setXFilter(filter),
    setMethod('GET')
  );

export const deleteLongviewClient = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/longview/clients/${id}`),
    setMethod('DELETE')
  );

export const updateLongviewClient = (id: number, label: string) => {
  return Request<LongviewClient>(
    setURL(`${API_ROOT}/longview/clients/${id}`),
    setData(
      {
        label
      },
      longviewClientCreate
    ),
    setMethod('PUT')
  );
};

export const getLongviewSubscriptions = () =>
  Request<ResourcePage<LongviewSubscription>>(
    setURL(`${API_ROOT}/longview/subscriptions`),
    setMethod('GET')
  );

export const getActiveLongviewPlan = () =>
  Request<ActiveLongviewPlan>(
    setURL(`${API_ROOT}/longview/plan`),
    setMethod('GET')
  );

/**
 * updateActiveLongviewPlan
 *
 * Change this account's Longview subscription. To move from a
 * paid Longview Pro plan back to the free plan, submit an empty
 * object.
 */
export const updateActiveLongviewPlan = (plan: LongviewSubscriptionPayload) =>
  Request<ActiveLongviewPlan>(
    setURL(`${API_ROOT}/longview/plan`),
    setData(plan),
    setMethod('PUT')
  );
