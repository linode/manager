import { thunkFetch } from './apiActionReducerGenerator';

export function updateConfigSSL(data, nodebalancerId, configId) {
  return thunkFetch.post(`/nodebalancers/${nodebalancerId}/configs/${configId}/ssl`, data);
}
