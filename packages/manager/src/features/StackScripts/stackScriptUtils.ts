import { getStackScripts } from '@linode/api-v4';

import type {
  Grant,
  Params,
  StackScript,
  StackScriptPayload,
} from '@linode/api-v4';

const oneClickFilter = [
  {
    '+and': [
      { '+or': [{ username: 'linode-stackscripts' }, { username: 'linode' }] },
      {
        label: {
          '+contains': 'One-Click',
        },
      },
    ],
    '+order_by': 'ordinal',
  },
];

export const getOneClickApps = (params?: Params) =>
  getStackScripts(params, oneClickFilter);

export const getStackScriptUrl = (
  username: string,
  id: number,
  currentUser?: string
) => {
  let type;
  let subtype;
  switch (username) {
    case 'linode':
      // This is a Marketplace App
      type = 'One-Click';
      subtype = 'One-Click%20Apps';
      break;
    case currentUser:
      // My StackScripts
      // @todo: handle account stackscripts
      type = 'StackScripts';
      subtype = 'Account';
      break;
    default:
      // Community StackScripts
      type = 'StackScripts';
      subtype = 'Community';
  }
  return `/linodes/create?type=${type}&subtype=${subtype}&stackScriptID=${id}`;
};

export const canUserModifyAccountStackScript = (
  isRestrictedUser: boolean,
  stackScriptGrants: Grant[],
  stackScriptID: number
) => {
  // If the user isn't restricted, they can modify any StackScript on the account
  if (!isRestrictedUser) {
    return true;
  }

  // Look for permissions for this specific StackScript
  const grantsForThisStackScript = stackScriptGrants.find(
    (eachGrant: Grant) => eachGrant.id === Number(stackScriptID)
  );

  // If there are no permissions for this StackScript (permissions:"none")
  if (!grantsForThisStackScript) {
    return false;
  }

  // User must have "read_write" permissions to modify StackScript
  return grantsForThisStackScript.permissions === 'read_write';
};

/**
 * Gets a comma separated string of Image IDs to display to the user
 * with the linode/ prefix removed from the Image IDs
 */
export const getStackScriptImages = (images: StackScript['images']) => {
  const cleanedImages: string[] = [];

  for (const image of images) {
    if (image === 'any/all') {
      return 'Any/All';
    }

    if (!image) {
      // Sometimes the API returns `null` in the images array 😳
      continue;
    }

    if (image.startsWith('linode/')) {
      cleanedImages.push(image.split('linode/')[1]);
    } else {
      cleanedImages.push(image);
    }
  }

  return cleanedImages.join(', ');
};
/**
 * Determines if a StackScript is a StackScript created by LKE.
 *
 * This function exists because the API returns these but we try
 * to hide these StackScripts from the user in the UI.
 */
export const isLKEStackScript = (stackscript: StackScript) => {
  return stackscript.username.startsWith('lke-service-account-');
};

export const stackscriptFieldNameOverrides: Partial<
  Record<keyof StackScriptPayload, string>
> = {
  rev_note: 'revision note',
};
