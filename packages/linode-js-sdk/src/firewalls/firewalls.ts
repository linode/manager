// import { API_ROOT } from '../constants';
// import Request, {
//   setData,
//   setMethod,
//   setParams,
//   setURL,
//   setXFilter
// } from '../request';
// import { ResourcePage as Page } from '../types'
import { Firewall } from './types';

/**
 * mocked GET firewalls
 */
export const getFirewalls = (
  mockData: Firewall[],
  params: any = {},
  filters: any = {}
) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        data: mockData,
        page: 1,
        pages: 1,
        results: mockData.length
      });
    }, 1000);
  }).then(data => {
    return data;
  });
};
