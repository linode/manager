import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from 'src/services';

export const getAccountInfo = () =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const updateAccountInfo = (data: Partial<Linode.Account>) =>
  Request<Linode.Account>(
    setURL(`${API_ROOT}/account`),
    setMethod('PUT'),
    setData(data),
  )
    .then(response => response.data);

export const getNetworkUtilization = () =>
  Request<Linode.NetworkUtilization>(
    setURL(`${API_ROOT}/account/transfer`),
    setMethod('GET'),
  )
  .then(response => response.data);

export const getAccountSettings = () =>
  Request<Linode.AccountSettings>(
    setURL(`${API_ROOT}/account/settings`),
    setMethod('GET')
  )
    .then(response => response.data);
