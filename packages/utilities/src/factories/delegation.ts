import { Factory } from './factoryProxy';

import type {
  Account,
  ChildAccount,
  ChildAccountWithDelegates,
  IamUserRoles,
} from '@linode/api-v4';

export const mockDelegateUsersList = [
  'John Doe',
  'Jill Smith',
  'Jack Black',
  'Barbara White',
  'Tom Brown',
  'Sam Davis',
  'Alice Wilson',
  'Bob Taylor',
  'Charlie Moore',
  'Diana Harris',
  'Ethan Clark',
  'Fiona Scott',
  'George Green',
  'Hannah Brown',
  'Isaac Lee',
  'Julia Davis',
  'Kevin Wilson',
  'Linda Moore',
  'Michael Harris',
  'Nancy Taylor',
  'Oliver Clark',
  'Patricia Scott',
  'Quincy Green',
];

export const childAccountFactory = Factory.Sync.makeFactory<ChildAccount>({
  company: Factory.each((i) => `child-account-${i}`),
  euuid: Factory.each(() => window.crypto.randomUUID()),
});

export const childAccountWithDelegatesFactory =
  Factory.Sync.makeFactory<ChildAccountWithDelegates>({
    company: Factory.each((i) => `child-account-${i}`),
    euuid: Factory.each(() => window.crypto.randomUUID()),
    users: [],
  });

export const delegatedChildAccountsForUserFactory =
  Factory.Sync.makeFactory<ChildAccount>({
    company: Factory.each((i) => `child-account-${i}`),
    euuid: Factory.each(() => window.crypto.randomUUID()),
  });

export const childAccountDelegatesFactory = Factory.Sync.makeFactory<string[]>(
  [],
);

export const myDelegatedChildAccountsFactory =
  Factory.Sync.makeFactory<Account>({
    euuid: Factory.each(() => window.crypto.randomUUID()),
    active_promotions: [],
    active_since: '',
    address_1: '',
    address_2: '',
    balance: 0,
    balance_uninvoiced: 0,
    billing_source: 'linode',
    capabilities: [],
    city: '',
    company: 'Parent Account Company',
    country: '',
    credit_card: {
      expiry: '',
      last_four: '',
    },
    email: 'parent@acme.com',
    first_name: 'Parent',
    last_name: 'Account',
    phone: '',
    state: '',
    tax_id: '',
    zip: '',
  });

export const delegateDefaultAccessFactory =
  Factory.Sync.makeFactory<IamUserRoles>({
    account_access: [],
    entity_access: [],
  });
