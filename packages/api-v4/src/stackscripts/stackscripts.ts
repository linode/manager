import {
  stackScriptSchema,
  updateStackScriptSchema,
} from '@linode/validation/lib/stackscripts.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { StackScript, StackScriptPayload } from './types';

/**
 * Returns a paginated list of StackScripts.
 *
 */
export const getStackScripts = (params?: Params, filter?: Filter) =>
  Request<Page<StackScript>>(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * Returns all of the information about a specified StackScript, including the contents of the script.
 *
 * @param stackscriptId { string } ID of the Image to look up.
 */
export const getStackScript = (stackscriptId: number) =>
  Request<StackScript>(
    setURL(
      `${API_ROOT}/linode/stackscripts/${encodeURIComponent(stackscriptId)}`,
    ),
    setMethod('GET'),
  );

/**
 * Creates a StackScript in your Account.
 *
 * @param payload { object }
 * @param payload.script { string } The script to execute when provisioning a new Linode with this StackScript.
 * @param payload.label { string } The StackScript's label is for display purposes only.
 * @param payload.images { string[] } An array of Image IDs representing the Images that this StackScript
 * is compatible for deploying with.
 * @param payload.description { string } A description for the StackScript.
 * @param payload.is_public { boolean } This determines whether other users can use your StackScript.
 * Once a StackScript is made public, it cannot be made private.
 * @param payload.rev_note { string } This field allows you to add notes for the set of revisions
 * made to this StackScript.
 */
export const createStackScript = (payload: StackScriptPayload) =>
  Request<StackScript>(
    setURL(`${API_ROOT}/linode/stackscripts`),
    setMethod('POST'),
    setData(payload, stackScriptSchema),
  );

/**
 * Updates a StackScript.
 *
 * @param stackscriptId { string } The ID of the StackScript to update.
 * @param payload { object }
 * @param payload.script { string } The script to execute when provisioning a new Linode with this StackScript.
 * @param payload.label { string } The StackScript's label is for display purposes only.
 * @param payload.images { string[] } An array of Image IDs representing the Images that this StackScript
 * is compatible for deploying with.
 * @param payload.description { string } A description for the StackScript.
 * @param payload.is_public { boolean } This determines whether other users can use your StackScript.
 * Once a StackScript is made public, it cannot be made private.
 * @param payload.rev_note { string } This field allows you to add notes for the set of revisions
 * made to this StackScript.
 */
export const updateStackScript = (
  stackscriptId: number,
  payload: Partial<StackScriptPayload>,
) =>
  Request<StackScript>(
    setURL(
      `${API_ROOT}/linode/stackscripts/${encodeURIComponent(stackscriptId)}`,
    ),
    setMethod('PUT'),
    setData(payload, updateStackScriptSchema),
  );

/**
 * Deletes a private StackScript you have permission to read_write. You cannot delete a public StackScript.
 *
 * @param stackscriptId { string } The ID of the StackScript to delete.
 */
export const deleteStackScript = (stackscriptId: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/stackscripts/${encodeURIComponent(stackscriptId)}`,
    ),
    setMethod('DELETE'),
  );
