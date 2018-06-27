/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

namespace Linode {
  export type TodoAny = any;

  export type Theme = TodoAny;

  export type NullableString = string | null;

  export type Hypervisor = 'kvm' | 'zen';

  export interface ResourcePage<T> {
    data: T[];
    page: number;
    pages: number;
    results: number;
  }

  export interface SingleResourceState<T> {
    data: T;
  }

  export interface ApiState {
    linodes?: ResourcePage<Linode.Linode>;
    linodeTypes?: ResourcePage<Linode.LinodeType>;
    images?: ResourcePage<Linode.Image>;
  }

  interface AuthState {
    token: NullableString;
    scopes: NullableString;
  }

  export interface ResourcesState {
    types?: { loading: boolean; data: ResourcePage<Linode.LinodeType>; };
    kernels?: { loading: boolean; data: Linode.Kernel[] };
    profile?: { loading: boolean; data: Linode.Profile };
  }

  export type DocumentationState = Linode.Doc[];

  export type VolumeDrawerState = {
    mode: string;
  };

  export interface AppState {
    authentication: AuthState;
    resources: ResourcesState;
    documentation: DocumentationState;
    volumeDrawer: VolumeDrawerState;
  }

  export interface LinodeSpecs {
    disk: number;
    memory: number;
    vcpus: number;
    transfer: number;
  }

  export interface PriceObject {
    monthly: number;
    hourly: number;
  }
  export type NotificationType =
    'migration_scheduled' |
    'migration_pending' |
    'reboot_scheduled' |
    'outage' |
    'payment_due' |
    'ticket_important' |
    'ticket_abuse' |
    'notice';

  export interface Notification {
    entity: null | Entity;
    label: string;
    message: string;
    type: NotificationType;
    severity: 'minor' | 'major' | 'critical';
    when: null | string;
    until: null | string;
  }

  export interface Entity {
    id: number;
    label: string;
    type: string;
    url: string;
  }

  export type EventAction =
    'linode_boot' |
    'linode_create' |
    'linode_delete' |
    'linode_shutdown' |
    'linode_reboot' |
    'linode_snapshot' |
    'linode_addip' |
    'linode_migrate' |
    'linode_rebuild' |
    'linode_clone' |
    'disk_create' |
    'disk_delete' |
    'disk_duplicate' |
    'disk_resize' |
    'backups_enable' |
    'backups_cancel' |
    'backups_restore' |
    'password_reset' |
    'domain_create' |
    'domain_delete' |
    'domain_record_create' |
    'domain_record_delete' |
    'stackscript_create' |
    'stackscript_publicize' |
    'stackscript_revise' |
    'stackscript_delete' |
    'volume_detach';

  export type EventStatus =
    'scheduled' |
    'started' |
    'finished' |
    'failed' |
    'notification';

  export interface Event {
    id: number;
    action: EventAction;
    created: string;
    entity: Entity | null;
    percent_complete: number | null;
    rate: string | null;
    read: boolean;
    seen: Boolean;
    status: EventStatus;
    time_remaining: null | number;
    username: string;
    _initial?: boolean;
  }

  export interface ApiFieldError {
    field: string;
    reason: string;
  }
}
