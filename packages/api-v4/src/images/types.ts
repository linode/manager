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
  label?: string;
  description?: string;
  cloud_init?: boolean;
}

export interface CreateImagePayload extends BaseImagePayload {
  diskID: number;
}

export interface ImageUploadPayload extends BaseImagePayload {
  label: string;
  region: string;
}
