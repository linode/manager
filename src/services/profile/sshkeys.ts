import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '..';

type Page<T> = Linode.ResourcePage<T>;
type SSHKey = Linode.SSHKey;

export const getSSHKeys = (pagination: any = {}, filters: any = {}) =>
  Request<Page<SSHKey>>(
    setMethod('GET'),
    setParams(pagination),
    setXFilter(filters),
    setURL(`${API_ROOT}/profile/sshkeys`),
  )
    .then(response => response.data);

export const createSSHKey = (data: { label: string, ssh_key: string }) =>
  Request<SSHKey>(
    setMethod('POST'),
    setURL(`${API_ROOT}/profile/sshkeys`),
    setData(data),
  )
    .then(response => response.data);

export const deleteSSHKey = (id: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/profile/sshkeys/${id}`),
  )
    .then(response => response.data);
