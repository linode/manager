import { Image } from 'linode-js-sdk/lib/images';
import { APIError, ResourcePage } from 'linode-js-sdk/lib/types';
import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/images`);

export const getImagesRequest = actionCreator(`request`);

export const getImagesSuccess = actionCreator<ResourcePage<Image>>(`success`);

export const getImagesFailure = actionCreator<APIError[]>(`fail`);

export const removeImage = actionCreator<number | string>(`remove`);

export const addOrUpdateImage = actionCreator<Image>('add_or_update');
