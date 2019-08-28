namespace Linode {
  export interface Volume {
    id: number;
    label: string;
    status: VolumeStatus;
    size: number;
    region: string;
    linode_id: null | number;
    created: string;
    updated: string;
    filesystem_path: string;
    recentEvent?: Event;
    tags: string[];
  }

  export type VolumeStatus =
    | 'creating'
    | 'active'
    | 'resizing'
    | 'deleting'
    | 'deleted'
    | 'contact_support';

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
    | 'linode_migrate_datacenter_create'
    | 'linode_migrate_datacenter'
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
  }
}
