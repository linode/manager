/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

namespace Linode {
  export type TodoAny = any;

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

  export type NotificationSeverity = 'minor' | 'major' | 'critical';

  export interface Notification {
    entity: null | Entity;
    label: string;
    message: string;
    type: NotificationType;
    severity: NotificationSeverity;
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
    'backups_cancel' |
    'backups_enable' |
    'backups_restore' |
    'disk_create' |
    'disk_delete' |
    'disk_duplicate' |
    'disk_imagize' |
    'disk_resize' |
    'domain_create' |
    'domain_delete' |
    'domain_record_create' |
    'domain_record_delete' |
    'image_delete' |
    'linode_addip' |
    'linode_boot' |
    'linode_clone' |
    'linode_create' |
    'linode_delete' |
    'linode_migrate' |
    'linode_reboot' |
    'linode_rebuild' |
    'linode_shutdown' |
    'linode_snapshot' |
    'nodebalancer_config_create' |
    'nodebalancer_config_delete' |
    'nodebalancer_create' |
    'nodebalancer_delete' |
    'password_reset' |
    'stackscript_create' |
    'stackscript_delete' |
    'stackscript_publicize' |
    'stackscript_revise' |
    'volume_create' |
    'volume_delete' |
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
    field?: string;
    reason: string;
  }

  export interface PaginationOptions {
    page?: number,
    page_size?: number,
  }

  export interface SupportTicket {
    opened: string;
    id: number;
    closed: string | null;
    description: string;
    entity: any | null;
    gravatar_id: string;
    attachments: string[];
    opened_by: string;
    status: 'closed' | 'new' | 'open';
    summary: string;
    updated: string;
    updated_by: string;
    gravatarUrl: string | undefined;
  }

  export interface SupportReply {
    created: string;
    created_by: string;
    gravatar_id: string;
    description: string;
    id: number;
    from_linode: boolean;
    gravatarUrl: string | undefined;
  }
  export interface SSHKey {
    created: string;
    id: number;
    label: string;
    ssh_key: string;
  }
}
