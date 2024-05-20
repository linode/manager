export type ImageStatus =
  | 'available'
  | 'creating'
  | 'deleted'
  | 'pending_upload';

type ImageCapabilities = 'cloud-init';

export interface Image {
  eol: string | null;
  id: string;
  label: string;
  description: string | null;
  created: string;
  updated: string;
  type: string;
  is_public: boolean;
  size: number;
  created_by: null | string;
  vendor: string | null;
  deprecated: boolean;
  expiry: null | string;
  status: ImageStatus;
  capabilities: ImageCapabilities[];
}

export interface UploadImageResponse {
  image: Image;
  upload_to: string;
}

export interface BaseImagePayload {
  /**
   * A short title of this Image.
   *
   * Defaults to the label of the Disk it is being created from if not provided.
   */
  label?: string;
  /**
   * A detailed description of this Image.
   */
  description?: string;
  /**
   * Whether this Image supports cloud-init.
   * @default false
   */
  cloud_init?: boolean;
  /**
   * An array of Tags applied to this Image. Tags are for organizational purposes only.
   */
  tags?: string[];
}

export interface CreateImagePayload extends BaseImagePayload {
  /**
   * The ID of the Linode Disk that this Image will be created from.
   */
  disk_id: number;
}

export interface ImageUploadPayload extends BaseImagePayload {
  label: string;
  region: string;
}
