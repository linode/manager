import { Image } from '@linode/api-v4';
import { imageFactory } from '@linode/utilities';
import { DateTime } from 'luxon';
import { http, StrictResponse } from 'msw';

import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { mswDB } from '../../../indexedDB';

import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

const getImageInfo = async (id: string) => {
  const image = await mswDB.get('images', id);
  if (!image) {
    return makeNotFoundResponse();
  }

  return makeResponse(image);
};

export const getImages = (mockState: MockState) => [
  http.get(
    '*/v4/images',
    ({
      request,
    }): StrictResponse<APIErrorResponse | APIPaginatedResponse<Image>> => {
      return makePaginatedResponse({
        data: mockState.images,
        request,
      });
    }
  ),

  http.get(
    '*/v4/images/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Image>> => {
      return await getImageInfo(String(params.id));
    }
  ),

  http.get(
    '*/v4beta/images/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Image>> =>
      await getImageInfo(String(params.id))
  ),
];

export const createImage = (mockState: MockState) => [
  http.post(
    '*/v4/images',
    async ({ request }): Promise<StrictResponse<APIErrorResponse | Image>> => {
      const payload = await request.clone().json();
      const image = imageFactory.build({
        ...payload,
        created: DateTime.now().toISO(),
      });

      await mswDB.add('images', image, mockState);

      return makeResponse(image);
    }
  ),
];

export const updateImageRegions = (mockState: MockState) => [
  http.post(
    '*/v4/images/:id/regions',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Image>> => {
      const imageId = String(params.id);
      const image = await mswDB.get('images', imageId);

      if (!image) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };

      const updatedImage = {
        ...image,
        ...payload,
      };

      await mswDB.update('images', imageId, updatedImage, mockState);

      return makeResponse(updatedImage);
    }
  ),
];

export const updateImage = (mockState: MockState) => [
  http.put(
    '*/v4/images/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | Image>> => {
      const imageId = String(params.id);
      const image = await mswDB.get('images', imageId);

      if (!image) {
        return makeNotFoundResponse();
      }

      const payload = {
        ...(await request.clone().json()),
        updated: DateTime.now().toISO(),
      };

      const updatedImage = {
        ...image,
        ...payload,
      };

      await mswDB.update('images', imageId, updatedImage, mockState);

      return makeResponse(updatedImage);
    }
  ),
];

export const deleteImage = (mockState: MockState) => [
  http.delete(
    '*/v4/images/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const imageId = String(params.id);
      const image = await mswDB.get('images', imageId);

      if (!image) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('images', imageId, mockState);

      return makeResponse({});
    }
  ),
];
