export type ImageStatus = 'available' | 'creating' | 'pending_upload';

export type ImageCapabilities = 'cloud-init' | 'distributed-sites';

type ImageType = 'automatic' | 'manual';

export type ImageRegionStatus =
  | 'available'
  | 'creating'
  | 'pending'
  | 'pending deletion'
  | 'pending replication'
  | 'replicating'
  | 'timedout';

export interface ImageRegion {
  region: string;
  status: ImageRegionStatus;
}

export interface Image {
  /**
   * A list of the capabilities of this image.
   */
  capabilities: ImageCapabilities[];

  /**
   * The timestamp of when this image was created.
   */
  created: string;

  /**
   * The name of the user who created this image or 'linode' for public images.
   */
  created_by: null | string;

  /**
   * Whether this is a public image that is deprecated.
   */
  deprecated: boolean;

  /**
   * A detailed description of this image.
   */
  description: null | string;

  /**
   * An optional timestamp of this image's planned end-of-life.
   */
  eol: null | string;

  /**
   * A timestamp of when this image will expire if it was automatically captured.
   */
  expiry: null | string;

  /**
   * The unique ID of the this image.
   */
  id: string;

  /**
   * Whether this image is marked for public distribution.
   */
  is_public: boolean;

  /**
   * A short description of this image.
   */
  label: string;

  /**
   * A list of the regions in which this image is available.
   */
  regions: ImageRegion[];

  /**
   * The minimum size in MB needed to deploy this image.
   */
  size: number;

  /**
   * The current status of this image.
   */
  status: ImageStatus;

  /**
   * A list of tags added to this image.
   */
  tags: string[];

  /**
   * The total storage consumed by this image across its regions.
   */
  total_size: number;

  /**
   * Indicates the method of this image's creation.
   */
  type: ImageType;

  /**
   * The timestamp of when this image was last updated.
   */
  updated: string;

  /**
   * The distribution author.
   */
  vendor: null | string;
}

export interface UploadImageResponse {
  image: Image;
  upload_to: string;
}

export interface BaseImagePayload {
  /**
   * Whether this Image supports cloud-init.
   * @default false
   */
  cloud_init?: boolean;
  /**
   * A detailed description of this Image.
   */
  description?: string;
  /**
   * A short title of this Image.
   *
   * Defaults to the label of the Disk it is being created from if not provided.
   */
  label?: string;
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

export type UpdateImagePayload = Omit<BaseImagePayload, 'cloud_init'>;

export interface ImageUploadPayload extends BaseImagePayload {
  label: string;
  region: string;
}

export interface UpdateImageRegionsPayload {
  /**
   * An array of region ids
   */
  regions: string[];
}
