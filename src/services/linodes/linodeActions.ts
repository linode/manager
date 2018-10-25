import { omit } from 'ramda';

import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

type Linode = Linode.Linode;

/* tslint:disable-next-line */
export type RescueRequestObject = Pick<Linode.Devices, 'sda' | 'sdb' | 'sdc' | 'sdd' | 'sde' | 'sdf' | 'sdg'>

export interface LinodeCloneData {
  // linode_id is missing here beacuse we removed the ability
  // to clone to an existing linode
  region?: string | null;
  type?: string | null;
  label?: string | null;
  backups_enabled?: boolean | null;
}

export const linodeBoot = (id: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/boot`),
    setMethod('POST'),
  );

export const linodeReboot = (id: number | string, data: any) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/reboot`),
    setMethod('POST'),
    setData(data),
  );

export const linodeShutdown = (id: number | string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}/shutdown`),
    setMethod('POST'),
  );

  export const resizeLinode = (id: number, type: string) =>
    Request<{}>(
      setURL(`${API_ROOT}/linode/instances/${id}/resize`),
      setMethod('POST'),
      setData({ type }),
    );

  export const rebuildLinode = (id: number, image: string, password: string, users: string[] = []) =>
    Request<{}>(
      setURL(`${API_ROOT}/linode/instances/${id}/rebuild`),
      setMethod('POST'),
      setData({ image, root_pass: password, authorized_users: users }),
    ).then(response => response.data);

export const rescueLinode = (linodeId: number, devices: RescueRequestObject): Promise<{}> =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/rescue`),
    setMethod('POST'),
    setData({ devices: omit(['sdh'], devices) }),
  );

export const cloneLinode = (sourceLinodeId: number, data: LinodeCloneData) => {
  return Request<Linode>(
    setURL(`${API_ROOT}/linode/instances/${sourceLinodeId}/clone`),
    setMethod('POST'),
    setData(data),
  )
    .then(response => response.data);
};

export const startMutation = (linodeID: number) => {
  return Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/mutate`),
    setMethod('POST'),
  )
    .then(response => response.data)
}

export const scheduleOrQueueMigration = (linodeID: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/migrate`),
    setMethod('POST'),
  )
