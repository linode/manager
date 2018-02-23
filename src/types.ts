/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

type TodoAny = any;

/******************************************************************************
 * Linodes
******************************************************************************/
interface Linode {
  id: string;
  alerts: LinodeAlerts;
  backups: LinodeBackups;
  created: string;
  region: string;
  image: string;
  group: string;
  ipv4: string[];
  ipv6: string;
  label: string;
  type: string;
  status: LinodeStatus;
  updated: string;
  hypervisor: Hypervisor;
  specs: LinodeSpecs;
}


interface LinodeAlerts {
  cpu: number;
  io: number;
  network_in: number;
  network_out: number;
  transfer_quote: number;
}

interface LinodeBackups {
  enabled: boolean;
  schedule: TodoAny;
  last_backup: TodoAny;
  snapshot: TodoAny;
}

type LinodeStatus = 'offline'
  | 'booting'
  | 'running'
  | 'shutting_down'
  | 'rebooting'
  | 'provisioning'
  | 'deleting'
  | 'migrating';

type Hypervisor = 'kvm' | 'zen';

interface LinodeSpecs {
  disk: number;
  memory: number;
  vcpus: number;
  transfer: number;
}
