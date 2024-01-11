import {
  AssignVmsToPlacementGroupSchema,
  CreatePlacementGroupSchema,
  UnassignVmsFromPlacementGroupSchema,
} from '@linode/validation/lib/vm-placement.schema';
import { API_ROOT } from '../constants';

import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import type { Filter, Params, ResourcePage as Page } from '../types';
import type { PlacementGroup, CreatePlacementGroupPayload } from './types';

/**
 * getPlacementGroups
 *
 * Returns a paginated list of all Placement Groups which this customer has created.
 */
export const getPlacementGroups = (params?: Params, filter?: Filter) =>
  Request<Page<PlacementGroup>>(
    setURL(`${API_ROOT}/placement/groups`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter)
  );

/**
 * getPlacementGroup
 *
 * Get a single Placement Group by its id.
 *
 * @param placementGroupId { number } The id of the Placement Group to be fetched.
 */
export const getPlacementGroup = (placementGroupId: number) =>
  Request<PlacementGroup>(
    setMethod('GET'),
    setURL(`${API_ROOT}/placement/groups/${placementGroupId}`)
  );

/**
 * createPlacementGroup
 *
 *  Creates a Placement Group.
 *
 * @param data { PlacementGroup } The data for the Placement Group.
 */
export const createPlacementGroup = (data: CreatePlacementGroupPayload) =>
  Request<PlacementGroup>(
    setMethod('POST'),
    setData(data, CreatePlacementGroupSchema),
    setURL(`${API_ROOT}/placement/groups`)
  );

/**
 * assignVmsToPlacementGroup
 *
 *  Assign Linodes to a Placement Group.
 *
 *  @param placementGroupId { number } The id of the Placement Group to add linodes to.
 *  @param linodeIds { number[] } The ids of the Linodes to add to the Placement Group.
 */
export const assignVmsToPlacementGroup = (
  placementGroupId: number,
  linodeIds: PlacementGroup['linode_ids']
) =>
  Request<PlacementGroup>(
    setMethod('POST'),
    setData(linodeIds, AssignVmsToPlacementGroupSchema),
    setURL(`${API_ROOT}/placement/groups/${placementGroupId}/assign`)
  );

/**
 * unassignVmsFromPlacementGroup
 *
 *  Unassign Linodes from a Placement Group.
 *
 *  @param placementGroupId { number } The id of the Placement Group to remove linodes from.
 *  @param linodeIds { number[] } The ids of the Linodes to remove from the Placement Group.
 */
export const unassignVmsFromPlacementGroup = (
  placementGroupId: number,
  linodeIds: PlacementGroup['linode_ids']
) =>
  Request<PlacementGroup>(
    setMethod('POST'),
    setData(linodeIds, UnassignVmsFromPlacementGroupSchema),
    setURL(`${API_ROOT}/placement/groups/${placementGroupId}/unassign`)
  );
