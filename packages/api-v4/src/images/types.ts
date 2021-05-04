export type ImageStatus =
  | 'available'
  | 'creating'
  | 'deleted'
  | 'pending_upload';

export interface Image {
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
}

export interface UploadImageResponse {
  image: Image;
  upload_to: string;
}

export interface BaseImagePayload {
  label?: string;
  description?: string;
}

export interface CreateImagePayload extends BaseImagePayload {
  diskID: number;
}

export interface ImageUploadPayload extends BaseImagePayload {
  label: string;
  region: string;
}
