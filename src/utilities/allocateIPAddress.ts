import { allocateIPAddress } from 'src/services/linodes';

export const allocatePublicIP = (linodeId: number) =>
  allocateIPAddress(linodeId, { type: 'ipv4', public: true });

export const allocatePrivateIP = (linodeId: number) =>
  allocateIPAddress(linodeId, { type: 'ipv4', public: false });
