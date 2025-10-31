export type ImageStatus = 'available' | 'creating' | 'pending_upload';

export type ImageCapabilities = 'cloud-init' | 'distributed-sites';

type ImageType = 'automatic' | 'manual' | 'shared';

type SharegroupMemberStatus = 'active' | 'revoked';

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

export interface ImageSharingData {
  shared_by: null | {
    sharegroup_id: number;
    sharegroup_label: string;
    sharegroup_uuid: string;
    source_image_id: number;
  };
  shared_with: null | {
    sharegroup_count: number;
    sharegroup_list_url: string;
  };
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
   * Image sharing attributes for private and shared images.
   */
  image_sharing?: ImageSharingData;

  /**
   * Whether this image is marked for public distribution.
   */
  is_public: boolean;

  /**
   * Whether this image has a shared copy.
   */
  is_shared?: boolean;

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

export interface Sharegroup {
  /**
   * The timestamp of when the Sharegroup was created
   */
  created: string;
  /**
   * A detailed description for the Sharegroup
   */
  description: string;
  /**
   * The timestamp of when the Sharegroup would expire
   */
  expiry?: string;
  /**
   * The ID of the this Sharegroup.
   */
  id: number;
  /**
   * The number of images shared in the Sharegroup
   */
  images_count?: number;
  /**
   * A boolean that indicates if the Sharegroup is suspended
   */
  is_suspended: boolean;
  /**
   * A short title for the Sharegroup
   */
  label: string;
  /**
   * The number of members present in the Sharegroup
   */
  members_count?: number;
  /**
   * The timestamp of when the Sharegroup was last updated
   */
  updated: string;
  /**
   * A unique identifier for the sharegroup which can be used to generate member tokens
   */
  uuid: string;
}

export interface SharegroupImagePayload {
  /**
   * A detailed description of this Image.
   */
  description?: string;
  /**
   * ID of the private image that will be added to the Sharegroup
   */
  id: string;
  /**
   * A short title of this Image.
   *
   * Defaults to the label of the private image it is being created from if not provided.
   */
  label?: string;
}

export interface CreateSharegroupPayload {
  /**
   * A detailed description of this Sharegroup.
   */
  description?: string;
  /**
   * An array of images that will be shared in the Sharegroup
   */
  images?: SharegroupImagePayload[];
  /**
   * A short title of this Sharegroup.
   */
  label: string;
}

export type UpdateSharegroupPayload = Omit<CreateImagePayload, 'images'>;

export interface AddSharegroupImagesPayload {
  /**
   * An array of images that will be shared in the Sharegroup
   */
  images: SharegroupImagePayload[];
}

export type UpdateSharegroupImagePayload = Omit<SharegroupImagePayload, 'id'>;

export interface AddSharegroupMemberPayload {
  /**
   * The title given to the user in the sharegroup
   */
  label: string;
  /**
   * The user token shared by the user to join the sharegroup
   */
  token: string;
}

export type UpdateSharegroupMemberPayload = Omit<
  AddSharegroupMemberPayload,
  'token'
>;

export interface SharegroupMember {
  /**
   * The timestamp of when the member was added to the sharegroup
   */
  created: string;
  /**
   * The timestamp of when the member's token expires
   */
  expiry: string;
  /**
   * The title given to the user in the sharegroup
   */
  label: string;
  /**
   * The status of the member in the current sharegroup
   */
  status: SharegroupMemberStatus;
  /**
   * A unique identifier for member tokens
   */
  token_uuid: string;
  /**
   * The timestamp of when the member's information was last updated
   */
  updated: string;
}

export interface GenerateSharegroupTokenPayload {
  /**
   * The title given to the user in the sharegroup
   */
  label?: string;
  /**
   * The sharegroup UUID for which a user token will be generated
   */
  valid_for_sharegroup_uuid: string;
}

export interface SharegroupToken {
  /**
   * The timestamp of when the token was created
   */
  created: string;
  /**
   * The timestamp of when the token will expire
   */
  expiry: string;
  /**
   * The title given to the user in the sharegroup
   */
  label: string;
  /**
   * The sharegroup label this token is created for
   */
  sharegroup_label: string;
  /**
   * The sharegroup UUID the token is created for
   */
  sharegroup_uuid: string;
  /**
   * The current status of this token
   */
  status: string;
  /**
   * A unique member token to join the sharegroup
   */
  token: string;
  /**
   * A unique identifier for each token generated
   */
  token_uuid: string;
  /**
   * The timestamp of when the token was last updated
   */
  updated: string;
  /**
   * The sharegroup UUID the token is valid for
   */
  valid_for_sharegroup_uuid: string;
}
