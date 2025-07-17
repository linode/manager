import { http } from 'msw';

import { cloudNATFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type { CloudNAT, CloudNATIPAddress } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getCloudNATs = () => [
  http.get(
    '*/v4/networking/cloudnats',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<CloudNAT>>
    > => {
      const cloudNATs = await mswDB.getAll('cloudnats');

      return makePaginatedResponse({
        data: cloudNATs || [],
        request,
      });
    }
  ),

  http.get(
    '*/v4/networking/cloudnats/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | CloudNAT>> => {
      const id = Number(params.id);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      return makeResponse(cloudNAT);
    }
  ),
];

export const createCloudNAT = (mockState: MockState) => [
  http.post(
    '*/v4/networking/cloudnats',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | CloudNAT>> => {
      const payload = await request.clone().json();

      const cloudNAT = cloudNATFactory.build({
        ...payload,
        addresses: ['203.0.113.100'],
      });

      await mswDB.add('cloudnats', cloudNAT, mockState);

      return makeResponse(cloudNAT);
    }
  ),
];

export const updateCloudNAT = (mockState: MockState) => [
  http.put(
    '*/v4/networking/cloudnats/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | CloudNAT>> => {
      const id = Number(params.id);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      const payload = await request.clone().json();
      const updatedCloudNAT = { ...cloudNAT, ...payload };

      await mswDB.update('cloudnats', id, updatedCloudNAT, mockState);

      return makeResponse(updatedCloudNAT);
    }
  ),
];

export const deleteCloudNAT = (mockState: MockState) => [
  http.delete(
    '*/v4/networking/cloudnats/:id',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      await mswDB.delete('cloudnats', id, mockState);

      return makeResponse({});
    }
  ),
];

export const getCloudNATAddresses = () => [
  http.get(
    '*/v4/networking/cloudnats/:id/addresses',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<CloudNATIPAddress>>
    > => {
      const id = Number(params.id);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: cloudNAT.addresses || [],
        request,
      });
    }
  ),
];

export const getCloudNATAddress = () => [
  http.get(
    '*/v4/networking/cloudnats/:id/addresses/:address',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | CloudNATIPAddress>> => {
      const id = Number(params.id);
      const address = String(params.address);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      const cloudNATAddress = cloudNAT.addresses.find(
        (addr) => addr.address === address
      );

      if (!cloudNATAddress) {
        return makeNotFoundResponse();
      }

      return makeResponse(cloudNATAddress);
    }
  ),
];

export const assignCloudNATAddress = (mockState: MockState) => [
  http.post(
    '*/v4/networking/cloudnats/:id/addresses',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | CloudNATIPAddress>> => {
      const id = Number(params.id);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      const body = await request.clone().json();
      const newAddress =
        body.address === 'auto'
          ? { address: `203.0.113.${100 + cloudNAT.addresses.length}` }
          : { address: body.address };

      cloudNAT.addresses.push(newAddress);
      await mswDB.update('cloudnats', id, cloudNAT, mockState);

      return makeResponse(newAddress);
    }
  ),
];

export const deleteCloudNATAddress = (mockState: MockState) => [
  http.delete(
    '*/v4/networking/cloudnats/:id/addresses/:address',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | {}>> => {
      const id = Number(params.id);
      const address = String(params.address);
      const cloudNAT = await mswDB.get('cloudnats', id);

      if (!cloudNAT) {
        return makeNotFoundResponse();
      }

      const addressIndex = cloudNAT.addresses.findIndex(
        (addr) => addr.address === address
      );

      if (addressIndex === -1) {
        return makeNotFoundResponse();
      }

      cloudNAT.addresses.splice(addressIndex, 1);
      await mswDB.update('cloudnats', id, cloudNAT, mockState);

      return makeResponse({});
    }
  ),
];
