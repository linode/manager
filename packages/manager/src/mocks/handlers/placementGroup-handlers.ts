import { http } from 'msw';

import { placementGroupFactory } from 'src/factories';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { getPaginatedSlice } from '../utilities/pagination';

import type { PlacementGroup } from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockContext } from 'src/mocks/types';
import type { APIErrorResponse } from 'src/mocks/utilities/response';

export const getPlacementGroups = (mockContext: MockContext) => [
  http.get('*/v4/placement/groups', ({ request }) => {
    const url = new URL(request.url);

    const pageNumber = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 25;
    const totalPages = Math.ceil(
      mockContext.placementGroups?.length / pageSize
    );
    const pageSlice = getPaginatedSlice(
      mockContext.placementGroups,
      pageNumber,
      pageSize
    );

    return makePaginatedResponse(pageSlice, pageNumber, totalPages);
  }),

  http.get(
    '*/v4/placement/group/:id',
    ({ params }): StrictResponse<APIErrorResponse | PlacementGroup> => {
      const id = Number(params.id);
      const placementGroup = mockContext.placementGroups.find(
        (contextPlacementGroup) => contextPlacementGroup.id === id
      );

      if (!placementGroup) {
        return makeNotFoundResponse();
      }

      return makeResponse(placementGroup);
    }
  ),
];

export const createPlacementGroup = (mockContext: MockContext) => [
  http.post(
    '*/v4/placement/groups',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | PlacementGroup>> => {
      const payload = await request.clone().json();

      const placementGroup = placementGroupFactory.build({
        affinity_type: payload['affinity_type'],
        is_compliant: true,
        is_strict: payload['is_strict'],
        label: payload['label'],
        members: [],
        region: payload['region'],
      });

      mockContext.placementGroups.push(placementGroup);
      return makeResponse(placementGroup);
    }
  ),
];

export const updatePlacementGroup = (mockContext: MockContext) => [
  http.put(
    '*/v4/placement/groups/:id',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | PlacementGroup>> => {
      const id = Number(params.id);
      const payload = await request.clone().json();

      const placementGroup = mockContext.placementGroups.find(
        (contextPlacementGroup) => contextPlacementGroup.id === id
      );

      if (!placementGroup) {
        return makeNotFoundResponse();
      }

      const updatedPlacementGroup = {
        ...placementGroup,
        ...payload,
      };

      // Updating contest store
      const placementGroupIndex = mockContext.placementGroups.indexOf(
        placementGroup
      );
      mockContext.placementGroups[placementGroupIndex] = updatedPlacementGroup;

      // TODO queue event.
      return makeResponse(updatedPlacementGroup);
    }
  ),
];

export const deletePlacementGroup = (mockContext: MockContext) => [
  http.delete('*/v4/placementGroup/:id', ({ params }) => {
    const id = Number(params.id);
    const placementGroup = mockContext.placementGroups.find(
      (contextPlacementGroup) => contextPlacementGroup.id === id
    );

    if (placementGroup) {
      const placementGroupIndex = mockContext.placementGroups.indexOf(
        placementGroup
      );
      if (placementGroupIndex >= 0) {
        mockContext.placementGroups.splice(placementGroupIndex, 1);
        return makeResponse({});
      }
    }

    return makeNotFoundResponse();
  }),
];
