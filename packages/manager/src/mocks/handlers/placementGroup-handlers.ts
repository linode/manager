import { http } from 'msw';

import { placementGroupFactory } from 'src/factories';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { queueEvents } from '../utilities/events';
import { getPaginatedSlice } from '../utilities/pagination';

import type {
  AssignLinodesToPlacementGroupPayload,
  CreatePlacementGroupPayload,
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';
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
    '*/v4/placement/groups/:id',
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
      const payload: CreatePlacementGroupPayload = await request.clone().json();

      const placementGroup = placementGroupFactory.build({
        ...payload,
        is_compliant: true,
        members: [],
      });

      mockContext.placementGroups.push(placementGroup);

      queueEvents({
        event: {
          action: 'placement_group_create',
          entity: {
            id: placementGroup.id,
            label: placementGroup.label,
            type: 'placement_group',
            url: `/v4/placement/groups/${placementGroup.id}`,
          },
        },
        mockContext,
        sequence: [{ status: 'notification' }],
      });

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
      const payload: UpdatePlacementGroupPayload = await request.clone().json();

      const placementGroup = mockContext.placementGroups.find(
        (contextPlacementGroup) => contextPlacementGroup.id === id
      );

      if (!placementGroup) {
        return makeNotFoundResponse();
      }

      Object.assign(placementGroup, payload);

      queueEvents({
        event: {
          action: 'placement_group_update',
          entity: {
            id: placementGroup.id,
            label: placementGroup.label,
            type: 'placement_group',
            url: `/v4/placement/groups/${placementGroup.id}`,
          },
        },
        mockContext,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(placementGroup);
    }
  ),
];

export const deletePlacementGroup = (mockContext: MockContext) => [
  http.delete('*/v4/placement/groups/:id', ({ params }) => {
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

        queueEvents({
          event: {
            action: 'placement_group_delete',
            entity: {
              id: placementGroup.id,
              label: placementGroup.label,
              type: 'placement_group',
              url: `/v4/placement/groups/${placementGroup.id}`,
            },
          },
          mockContext,
          sequence: [{ status: 'notification' }],
        });

        return makeResponse({});
      }
    }

    return makeNotFoundResponse();
  }),
];

export const placementGroupLinodeAssignment = (mockContext: MockContext) => [
  http.post(
    '*/v4/placement/groups/:id/assign',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | PlacementGroup>> => {
      const id = Number(params.id);
      const payload: AssignLinodesToPlacementGroupPayload = await request
        .clone()
        .json();

      const placementGroup = mockContext.placementGroups.find(
        (contextPlacementGroup) => contextPlacementGroup.id === id
      );
      const linodeAssigned = mockContext.linodes.find(
        (linode) => linode.id === payload['linodes'][0]
      );

      if (!placementGroup || !linodeAssigned) {
        return makeNotFoundResponse();
      }

      Object.assign(placementGroup, {
        members: [
          ...placementGroup.members,
          {
            linode_id: payload['linodes'][0],
          },
        ],
      });

      Object.assign(linodeAssigned, {
        placement_group: {
          affinity_type: placementGroup.affinity_type,
          id: placementGroup.id,
          is_strict: placementGroup.is_strict,
          label: placementGroup.label,
        },
      });

      // TODO queue event.
      return makeResponse(placementGroup);
    }
  ),

  http.post(
    '*/v4/placement/groups/:id/unassign',
    async ({
      params,
      request,
    }): Promise<StrictResponse<APIErrorResponse | PlacementGroup>> => {
      const id = Number(params.id);
      const payload: UnassignLinodesFromPlacementGroupPayload = await request
        .clone()
        .json();

      const placementGroup = mockContext.placementGroups.find(
        (contextPlacementGroup) => contextPlacementGroup.id === id
      );

      const linodeAssigned = mockContext.linodes.find(
        (linode) => linode.id === payload['linodes'][0]
      );

      if (!placementGroup || !linodeAssigned) {
        return makeNotFoundResponse();
      }

      Object.assign(placementGroup, {
        members: [
          ...placementGroup.members.filter(
            (member) => member.linode_id !== payload['linodes'][0]
          ),
        ],
      });

      Object.assign(linodeAssigned, {
        placement_group: null,
      });

      // TODO queue event.
      return makeResponse(placementGroup);
    }
  ),
];
