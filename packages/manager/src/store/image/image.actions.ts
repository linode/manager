import {
  CreateImagePayload,
  Image,
  ImageUploadPayload,
  UploadImageResponse,
} from '@linode/api-v4/lib/images';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/images`);

export const removeImage = actionCreator<number | string>(`remove`);

export const upsertImage = actionCreator<Image>('upsert');

export const requestImagesActions = actionCreator.async<
  void,
  Image[],
  APIError[]
>('request');

export const createImageActions = actionCreator.async<
  CreateImagePayload,
  Image,
  APIError[]
>('create');

export const uploadImageActions = actionCreator.async<
  ImageUploadPayload,
  UploadImageResponse,
  APIError[]
>('upload');

export interface UpdateImagePayload
  extends Pick<CreateImagePayload, 'label' | 'description'> {
  imageID: string;
}

export const updateImageActions = actionCreator.async<
  UpdateImagePayload,
  Image,
  APIError[]
>('update');

export const requestImageForStoreActions = actionCreator.async<
  string,
  Image,
  APIError[]
>('request-image');

export interface DeleteImagePayload {
  imageID: string;
}
export const deleteImageActions = actionCreator.async<
  DeleteImagePayload,
  {},
  APIError[]
>('delete');
