import {
  childAccountDelegates,
  defaultDelegationAccess,
  delegatedChildAccounts,
  generateChildAccountToken,
  getChildAccounts,
  getDelegatedChildAccountsForUser,
} from 'src/mocks/presets/crud/handlers/delegation';

import type { MockPresetCrud } from 'src/mocks/types';

export const childAccountsCrudPreset: MockPresetCrud = {
  group: { id: 'Child Accounts' },
  handlers: [
    getChildAccounts,
    getDelegatedChildAccountsForUser,
    childAccountDelegates,
    delegatedChildAccounts,
    generateChildAccountToken,
    defaultDelegationAccess,
  ],
  id: 'child-accounts:crud',
  label: 'Child Accounts CRUD',
};
