import {
  GlobalGrantTypes,
  Grant,
  GrantLevel,
  GrantType,
  Grants,
} from '@linode/api-v4/lib/account';

export type PermSelectValue = 'null' | 'read_only' | 'read_write' | null;

export interface UserGrantsState {
  grants: Grants[];
  originalGrants: Grants[];
}

export const initialState: UserGrantsState = {
  grants: [],
  originalGrants: [],
};

export type Action =
  | {
      changedGlobalPerm: string;
      type: 'GLOBAL_PERM_CHANGED';
      value: boolean;
    }
  | {
      entity: GrantType;
      entityPerms: GrantType[];
      type: 'ALL_SPECIFIC_PERMS_CHANGED';
    }
  | {
      entity: string;
      idx: number;
      type: 'SPECIFIC_PERM_CHANGED';
      value: GrantLevel;
    }
  | {
      entity: string;
      type: 'SPECIFIC_PERMS_SAVED';
      value: Grant;
    }
  | {
      grants: any;
      type: 'GRANTS_SET';
    }
  | {
      savedGlobalPerms: Record<GlobalGrantTypes, GrantLevel | boolean>;
      type: 'GLOBAL_PERMS_SAVED';
    }
  | { billingAccess: PermSelectValue; type: 'BILLING_ACCESS_CHANGED' }
  | { originalGrants: any; type: 'ORIGINAL_GRANTS_SET' }
  | { resetGlobalPerms: Grants; type: 'GLOBAL_PERMS_RESET' }
  | { resetSpecificPerms: Grants[]; type: 'SPECIFIC_PERMS_RESET' };

export const userGrantsReducer = (draft: UserGrantsState, action: Action) => {
  switch (action.type) {
    case 'GRANTS_SET':
      draft.grants = action.grants;
      return;
    // used to implement cancel functionality
    case 'ORIGINAL_GRANTS_SET':
      draft.originalGrants = action.originalGrants;
      return;
    case 'BILLING_ACCESS_CHANGED':
      draft.grants['global'].account_access = action.billingAccess;
      return;
    case 'GLOBAL_PERM_CHANGED':
      draft.grants['global'][action.changedGlobalPerm] = action.value;
      return;
    case 'GLOBAL_PERMS_RESET':
      draft.grants['global'] = action.resetGlobalPerms;
      return;
    case 'SPECIFIC_PERMS_RESET':
      draft.grants = action.resetSpecificPerms;
      return;
    case 'GLOBAL_PERMS_SAVED':
      draft.grants['global'] = action.savedGlobalPerms;
      draft.originalGrants['global'] = action.savedGlobalPerms;
      return;
    case 'SPECIFIC_PERMS_SAVED':
      draft.grants[action.entity] = action.value;
      draft.originalGrants[action.entity] = action.value;
      return;
    // Handles changes to dropdown menu and radio btn within the entity label
    case 'ALL_SPECIFIC_PERMS_CHANGED':
      draft.grants[action.entity] = action.entityPerms;
      return;
    case 'SPECIFIC_PERM_CHANGED':
      draft.grants[action.entity][action.idx]['permissions'] = action.value;
      return;
  }
};
