namespace Linode {
  export interface Volume {
    id: number;
    label: string;
    status: VolumeStatus;
    size: number;
    region: string;
    linode_id: number;
    created: string;
    updated: string;
    filesystem_path: string;
  }

  type VolumeStatus =
    'creating'
    | 'active'
    | 'resizing'
    | 'deleting'
    | 'deleted'
    | 'contact_support';
}
