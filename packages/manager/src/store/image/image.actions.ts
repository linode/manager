import { CreateImagePayload, Image } from 'linode-js-sdk/lib/images';
import { APIError } from 'linode-js-sdk/lib/types';
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
