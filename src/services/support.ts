import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from './index';

/** Alises for short lines. */
type Page<T> = Linode.ResourcePage<T>;
type SupportTicket = Linode.SupportTicket;


export const getTicketsPage = (page: number = 0, filter?: any) =>
  Request<Page<SupportTicket>>(
    setURL(`${API_ROOT}/support/tickets`),
    setMethod('GET'),
    setParams({ page }),
    setXFilter(filter),
  )

export const getOpenTicketsPage = (page: number = 0) =>
  getTicketsPage(page, {
    '+or': [
      { status: 'open'},
      { status: 'new' },
    ],
  })
// export const getVolumesPage = (page: number = 0) =>
//   Request<Page<Volume>>(
//     setURL(`${API_ROOT}/volumes`),
//     setMethod('GET'),
//     setParams({ page }),
//   )
//     .then(response => response.data);

// export const getVolumes = (): Promise<Linode.ResourcePage<Linode.Volume>> =>
//   getVolumesPage(1);

// export const attachVolume = (volumeId: number, payload: {
//   linode_id: number,
//   config_id?: number,
// }) => Request<Linode.Volume>(
//   setURL(`${API_ROOT}/volumes/${volumeId}/attach`),
//   setMethod('POST'),
//   setData(payload),
//   );

// export const detachVolume = (volumeId: number) => Request<{}>(
//   setURL(`${API_ROOT}/volumes/${volumeId}/detach`),
//   setMethod('POST'),
// );

// // delete is a reserve word
// export const deleteVolume = (volumeId: number) => Request<{}>(
//   setURL(`${API_ROOT}/volumes/${volumeId}`),
//   setMethod('DELETE'),
// );

// export const cloneVolume = (volumeId: number, label: string) => Request<{}>(
//   setURL(`${API_ROOT}/volumes/${volumeId}/clone`),
//   setMethod('POST'),
//   setData({ label }),
// );

// export const resizeVolume = (volumeId: number, size: number) => Request<{}>(
//   setURL(`${API_ROOT}/volumes/${volumeId}/resize`),
//   setMethod('POST'),
//   setData({ size }),
// );

// export const updateVolume = (volumeId: number, label: string) => Request<{}>(
//   setURL(`${API_ROOT}/volumes/${volumeId}`),
//   setMethod('PUT'),
//   setData({ label }),
// );

// export type VolumeRequestPayload = {
//   label: string,
//   size: number,
//   region?: string,
//   linode_id?: number,
// };

// export const createVolume = (payload: VolumeRequestPayload) => Request<{}>(
//   setURL(`${API_ROOT}/volumes`),
//   setMethod('POST'),
//   setData(payload),
// );
