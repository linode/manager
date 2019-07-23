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
    recentEvent?: Linode.Event;
    tags: string[];
  }

  export type VolumeStatus =
    | 'creating'
    | 'active'
    | 'resizing'
    | 'deleting'
    | 'deleted'
    | 'contact_support';
}
