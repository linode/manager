import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

export const getLinodeBackups = (id: number) =>
Request<Linode.LinodeBackupsResponse>(
  setURL(`${API_ROOT}/linode/instances/${id}/backups`),
  setMethod('GET'),
)
  .then(response => response.data);

export const enableBackups = (id: number) =>
Request<{}>(
  setURL(`${API_ROOT}/linode/instances/${id}/backups/enable`),
  setMethod('POST'),
);

export const cancelBackups = (id: number) =>
Request<{}>(
  setURL(`${API_ROOT}/linode/instances/${id}/backups/cancel`),
  setMethod('POST'),
);

export const takeSnapshot = (id: number, label: string) =>
Request<{}>(
  setURL(`${API_ROOT}/linode/instances/${id}/backups`),
  setMethod('POST'),
  setData({ label }),
);

/** @todo type */
export const restoreBackup = (
  linodeID: number,
  backupID: number,
  targetLinodeID: number,
  overwrite: boolean,
) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeID}/backups/${backupID}/restore`),
    setMethod('POST'),
    setData({ linodeId: targetLinodeID, overwrite }),
  )
    .then(response => response.data);


export const updateBackupsWindow = (id: number, day: string, window: string) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${id}`),
    setMethod('PUT'),
    setData({ backups: { schedule: { day, window } } }),
  );