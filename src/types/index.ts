/**
 * Necessary for ES6 import of svg/png files, else we would have to require() them.
 *
 * @see https://github.com/Microsoft/TypeScript-React-Starter/issues/12#issuecomment-326370098
 */
declare module '*.svg';
declare module '*.png';

declare module 'react-csv';

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
    | 'migration_scheduled'
    | 'migration_pending'
    | 'reboot_scheduled'
    | 'outage'
    | 'maintenance'
    | 'payment_due'
    | 'ticket_important'
    | 'ticket_abuse'
    | 'notice';

  export type NotificationSeverity = 'minor' | 'major' | 'critical';

  export interface Notification {
    entity: null | Entity;
    label: string;
    message: string;
    type: NotificationType;
    severity: NotificationSeverity;
    when: null | string;
    until: null | string;
    body: null | string;
  }

  export interface Entity {
    id: number;
    label: string;
    type: string;
    url: string;
  }

  export type EventAction =
    | 'account_update'
    | 'account_settings_update'
    | 'backups_cancel'
    | 'backups_enable'
    | 'backups_restore'
    | 'community_like'
    | 'community_question_reply'
    | 'credit_card_updated'
    | 'disk_create'
    | 'disk_update'
    | 'disk_delete'
    | 'disk_duplicate'
    | 'disk_imagize'
    | 'disk_resize'
    | 'domain_create'
    | 'domain_update'
    | 'domain_delete'
    | 'domain_record_create'
    | 'domain_record_updated'
    | 'domain_record_delete'
    | 'image_update'
    | 'image_delete'
    | 'ipaddress_update'
    | 'linode_addip'
    | 'linode_boot'
    | 'linode_clone'
    | 'linode_create'
    | 'linode_update'
    | 'linode_delete'
    | 'linode_deleteip'
    | 'linode_migrate'
    | 'linode_reboot'
    | 'linode_resize'
    | 'linode_resize_create'
    | 'linode_mutate'
    | 'linode_mutate_create'
    | 'linode_rebuild'
    | 'linode_shutdown'
    | 'linode_snapshot'
    | 'linode_config_create'
    | 'linode_config_update'
    | 'linode_config_delete'
    | 'nodebalancer_config_create'
    | 'nodebalancer_config_update'
    | 'nodebalancer_config_delete'
    | 'nodebalancer_create'
    | 'nodebalancer_update'
    | 'nodebalancer_delete'
    | 'password_reset'
    | 'profile_update'
    | 'stackscript_create'
    | 'stackscript_update'
    | 'stackscript_delete'
    | 'stackscript_publicize'
    | 'stackscript_revise'
    | 'tfa_enabled'
    | 'tfa_disabled'
    | 'ticket_attachment_upload'
    | 'user_ssh_key_add'
    | 'user_ssh_key_update'
    | 'user_ssh_key_delete'
    | 'volume_create'
    | 'volume_update'
    | 'volume_delete'
    | 'volume_detach'
    | 'volume_attach'
    | 'volume_resize'
    | 'volume_clone';

  export type EventStatus =
    | 'scheduled'
    | 'started'
    | 'finished'
    | 'failed'
    | 'notification';

  export interface Event {
    id: number;
    action: EventAction;
    created: string;
    entity: Entity | null;
    percent_complete: number | null;
    rate: string | null;
    read: boolean;
    seen: boolean;
    status: EventStatus;
    time_remaining: null | number;
    username: string;
    _initial?: boolean;
    _hidden?: boolean;
  }
  /**
   * Represents an event which has an entity. For use with type guards.
   * https://www.typescriptlang.org/docs/handbook/advanced-types.html
   */
  export interface EntityEvent extends Event {
    entity: Entity;
  }

  export interface ApiFieldError {
    field?: string;
    reason: string;
  }

  export interface PaginationOptions {
    page?: number;
    page_size?: number;
  }

  export interface SupportTicket {
    opened: string;
    id: number;
    closed: string | null;
    closable: boolean;
    description: string;
    entity: Entity | null;
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
