import { http } from 'msw';

import { placementGroupFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import { queueEvents } from '../../../utilities/events';

import type {
  AssignLinodesToPlacementGroupPayload,
  CreatePlacementGroupPayload,
  PlacementGroup,
  UnassignLinodesFromPlacementGroupPayload,
  UpdatePlacementGroupPayload,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getPlacementGroups = () => [
  http.get(
    '*/v4/placement/groups',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<PlacementGroup>>
    > => {
      const placementGroups = await mswDB.getAll('placementGroups');

      if (!placementGroups) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: placementGroups,
        request,
      });
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

export const createPlacementGroup = (mockState: MockState) => [
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

      await mswDB.add('placementGroups', placementGroup, mockState);

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
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(placementGroup);
    }
  ),
];

export const updatePlacementGroup = (mockState: MockState) => [
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

      mswDB.update('placementGroups', id, payload, mockState);

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
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(placementGroup);
    }
  ),
];

export const deletePlacementGroup = (mockState: MockState) => [
  http.delete('*/v4/placement/groups/:id', async ({ params }) => {
    const id = Number(params.id);
    const placementGroup = await mswDB.get('placementGroups', id);

    if (!placementGroup) {
      return makeNotFoundResponse();
    }

    await mswDB.delete('placementGroups', id, mockState);

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
      mockState,
      sequence: [{ status: 'notification' }],
    });

    return makeResponse({});
  }),
];

export const placementGroupLinodeAssignment = (mockState: MockState) => [
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
        mockState
      );

      await mswDB.update(
        'linodes',
        linodeAssigned.id,
        {
          placement_group: {
            id: placementGroup.id,
            label: placementGroup.label,
            migrating_to: null,
            placement_group_policy: placementGroup.placement_group_policy,
            placement_group_type: placementGroup.placement_group_type,
          },
        },
        mockState
      );

      Object.assign(linodeAssigned, {
        placement_group: {
          id: placementGroup.id,
          label: placementGroup.label,
          placement_group_policy: placementGroup.placement_group_policy,
          placement_group_type: placementGroup.placement_group_type,
        },
      });

      queueEvents({
        event: {
          action: 'placement_group_assign',
          entity: {
            id: placementGroup.id,
            label: placementGroup.label,
            type: 'placement_group',
            url: `/v4/placement/groups/${placementGroup.id}`,
          },
          secondary_entity: {
            id: linodeAssigned.id,
            label: linodeAssigned.label,
            type: 'linode',
            url: `/v4/linode/instances/${linodeAssigned.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

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
        mockState
      );

      mswDB.update(
        'linodes',
        linodeAssigned.id,
        {
          placement_group: undefined,
        },
        mockState
      );

      queueEvents({
        event: {
          action: 'placement_group_unassign',
          entity: {
            id: placementGroup.id,
            label: placementGroup.label,
            type: 'placement_group',
            url: `/v4/placement/groups/${placementGroup.id}`,
          },
          secondary_entity: {
            id: linodeAssigned.id,
            label: linodeAssigned.label,
            type: 'linode',
            url: `/v4/linode/instances/${linodeAssigned.id}`,
          },
        },
        mockState,
        sequence: [{ status: 'notification' }],
      });

      return makeResponse(placementGroup);
    }
  ),
];
