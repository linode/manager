import { http } from 'msw';

import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
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
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getPlacementGroups = (mockContext: MockContext) => [
  http.get(
    '*/v4/placement/groups',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<PlacementGroup>>
    > => {
      const url = new URL(request.url);
      const placementGroups = await mswDB.getAll('placementGroups');

      if (!placementGroups) {
        return makeNotFoundResponse();
      }

      const pageNumber = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('page_size')) || 25;
      const totalPages = Math.ceil(placementGroups?.length / pageSize);
      const pageSlice = getPaginatedSlice(
        mockContext.placementGroups,
        pageNumber,
        pageSize
      );

      return makePaginatedResponse(pageSlice, pageNumber, totalPages);
    }
  ),

  http.get(
    '*/v4/placement/groups/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | PlacementGroup>> => {
      const id = Number(params.id);
      const placementGroup = await mswDB.get('placementGroups', id);

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

      await mswDB.add('placementGroups', placementGroup, mockContext);

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
      const placementGroup = await mswDB.get('placementGroups', id);

      if (!placementGroup) {
        return makeNotFoundResponse();
      }

      mswDB.update('placementGroups', id, payload, mockContext);

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
  http.delete('*/v4/placement/groups/:id', async ({ params }) => {
    const id = Number(params.id);
    const placementGroup = await mswDB.get('placementGroups', id);

    if (!placementGroup) {
      return makeNotFoundResponse();
    }

    await mswDB.delete('placementGroups', id, mockContext);

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
      const placementGroup = await mswDB.get('placementGroups', id);
      const linodeAssigned = await mswDB.get('linodes', payload['linodes'][0]);

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

      await mswDB.update(
        'placementGroups',
        placementGroup.id,
        {
          members: placementGroup.members,
        },
        mockContext
      );

      await mswDB.update(
        'linodes',
        linodeAssigned.id,
        {
          placement_group: {
            id: placementGroup.id,
            label: placementGroup.label,
            placement_group_policy: placementGroup.placement_group_policy,
            placement_group_type: placementGroup.placement_group_type,
          },
        },
        mockContext
      );

      Object.assign(linodeAssigned, {
        placement_group: {
          id: placementGroup.id,
          label: placementGroup.label,
          placement_group_policy: placementGroup.placement_group_policy,
          placement_group_type: placementGroup.placement_group_type,
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
      const placementGroup = await mswDB.get('placementGroups', id);
      const linodeAssigned = await mswDB.get('linodes', payload['linodes'][0]);

      if (!placementGroup || !linodeAssigned) {
        return makeNotFoundResponse();
      }

      mswDB.update(
        'placementGroups',
        placementGroup.id,
        {
          members: placementGroup.members.filter(
            (member) => member.linode_id !== payload['linodes'][0]
          ),
        },
        mockContext
      );

      mswDB.update(
        'linodes',
        linodeAssigned.id,
        {
          placement_group: undefined,
        },
        mockContext
      );

      // TODO queue event.
      return makeResponse(placementGroup);
    }
  ),
];
