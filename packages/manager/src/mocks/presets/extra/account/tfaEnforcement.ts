import { getProfile } from '@linode/api-v4';
import { profileFactory, securityQuestionsFactory } from '@linode/utilities';
import { http } from 'msw';

import { accountSettingsFactory, accountUserFactory } from 'src/factories';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeErrorResponse,
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  AccountSettings,
  IamAccountRoles,
  PermissionType,
  Profile,
  SecurityQuestionsData,
  TfaOptionalUser,
  UpdateTfaOptionalUsersPayload,
  UpdateTfaOptionalUsersResponse,
  User,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockPresetExtra } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export interface TfaEnforcementMockData {
  /** Whether profile security questions are answered (`GET /profile/security-questions`). */
  profileSecurityQuestionsConfigured: boolean;
  /** Whether the logged-in profile has 2FA configured (`GET /profile` → `two_factor_auth`). */
  profileTwoFactorAuth: boolean;
  /** Account-level 2FA enforcement (`/v4beta/account/settings`). */
  tfaEnforced: boolean;
  /** Usernames exempt from enforcement (`/v4beta/account/tfa-optional-users`). */
  tfaOptionalUsers: string[];
}

/** Default optional usernames when simulating partial (not all-users) enforcement. */
export const DEFAULT_TFA_OPTIONAL_USERNAMES = ['user-0'];

/** Static account users for TFA enforcement when IndexedDB has no seeded users. */
export const STATIC_TFA_ACCOUNT_USERNAMES = [
  'user-0',
  'user-1',
  'user-2',
] as const;

/** Mocked logged-in profile user (enforced when user-0 is optional). */
export const STATIC_TFA_PROFILE_USERNAME = 'user-1';

export const defaultTfaEnforcementMockData: TfaEnforcementMockData = {
  profileSecurityQuestionsConfigured: false,
  profileTwoFactorAuth: false,
  tfaEnforced: false,
  tfaOptionalUsers: [...DEFAULT_TFA_OPTIONAL_USERNAMES],
};

const loginSettingsAccountPermissions: PermissionType[] = [
  // TFA enforcement
  'is_account_admin',
  'update_account_settings',
  'list_tfa_optional_users',
  'update_tfa_optional_users',
  'view_user',
  // SSO / IDP configuration
  'view_idp_config',
  'create_idp_config',
  'update_idp_config',
  'delete_idp_config',
  'create_idp_config_cert',
  'view_idp_config_certs',
  'delete_idp_config_cert',
  'update_idp_config_user_includes',
  'update_idp_config_user_excludes',
];

let tfaEnforcementData: null | TfaEnforcementMockData = null;

export const setTfaEnforcementData = (data: null | TfaEnforcementMockData) => {
  tfaEnforcementData = data;
};

export const getTfaEnforcementData = () => tfaEnforcementData;

const getData = (): TfaEnforcementMockData => ({
  ...defaultTfaEnforcementMockData,
  ...(tfaEnforcementData ?? {}),
});

const getUserTfaEnforced = (username: string) => {
  const data = getData();

  if (data.tfaOptionalUsers.includes(username)) {
    return false;
  }

  return data.tfaEnforced;
};

const withUserTfaEnforced = (user: User): User => ({
  ...user,
  tfa_enforced: getUserTfaEnforced(user.username),
});

const withUsersTfaEnforced = (users: User[]) =>
  users.map((user) => withUserTfaEnforced(user));

const withProfileTfaEnforced = (): Profile => {
  const data = getData();
  const profile = profileFactory.build({
    user_type: 'default',
    username: STATIC_TFA_PROFILE_USERNAME,
  });

  return {
    ...profile,
    tfa_enforced: getUserTfaEnforced(profile.username),
    two_factor_auth: data.profileTwoFactorAuth,
  };
};

const toTfaOptionalUser = (username: string): TfaOptionalUser => ({
  url: `/account/users/${username}`,
  username,
});

const filterUsersByProfileType = async (users: User[]) => {
  const profile = await getProfile();
  const userTypeFromProfile = profile?.user_type;

  if (userTypeFromProfile === 'default') {
    return users.filter((user) => user.user_type === 'default');
  }

  if (userTypeFromProfile === 'parent') {
    return users.filter((user) => user.user_type === 'parent');
  }

  if (userTypeFromProfile === 'child') {
    return users.filter(
      (user) => user.user_type === 'child' || user.user_type === 'delegate'
    );
  }

  return users;
};

let cachedStaticAccountUsers: null | User[] = null;

const getStaticAccountUsers = (): User[] => {
  if (!cachedStaticAccountUsers) {
    cachedStaticAccountUsers = STATIC_TFA_ACCOUNT_USERNAMES.map((username) =>
      accountUserFactory.build({ username })
    );
  }

  return cachedStaticAccountUsers;
};

const getAccountUsers = async () => {
  const users = await mswDB.getAll('users');

  if (users && users.length > 0) {
    return users;
  }

  return getStaticAccountUsers();
};

const getOptionalUsernamesForAccount = async () => {
  const accountUsernames = new Set(
    (await getAccountUsers()).map((user) => user.username)
  );

  return getData().tfaOptionalUsers.filter((username) =>
    accountUsernames.has(username)
  );
};

const answeredSecurityQuestions: SecurityQuestionsData =
  securityQuestionsFactory.build({
    security_questions: [
      {
        id: 1,
        question: 'In what city were you born?',
        response: 'Springfield',
      },
      {
        id: 2,
        question: 'What is the name of your oldest sibling?',
        response: 'Alex',
      },
      {
        id: 3,
        question: 'What was the first concert you attended?',
        response: 'Rock Fest',
      },
    ],
  });

const getSecurityQuestionsResponse = (): SecurityQuestionsData =>
  getData().profileSecurityQuestionsConfigured
    ? answeredSecurityQuestions
    : securityQuestionsFactory.build();

const mockTfaEnforcement = () => [
  http.get(
    '*/v4*/iam/users/:username/permissions/account',
    async (): Promise<StrictResponse<PermissionType[]>> => {
      return makeResponse(loginSettingsAccountPermissions);
    }
  ),

  http.get(
    '*/v4*/iam/role-permissions',
    async (): Promise<StrictResponse<IamAccountRoles>> => {
      return makeResponse(accountRolesFactory.build());
    }
  ),

  http.get('*/v4*/account/settings', () => {
    return makeResponse(
      accountSettingsFactory.build({ tfa_enforced: getData().tfaEnforced })
    );
  }),

  http.put(
    '*/v4*/account/settings',
    async ({ request }): Promise<StrictResponse<AccountSettings>> => {
      const body = (await request.json()) as Partial<AccountSettings>;
      const tfaEnforced = body.tfa_enforced ?? getData().tfaEnforced;

      tfaEnforcementData = {
        ...getData(),
        tfaEnforced,
      };

      return makeResponse(
        accountSettingsFactory.build({ ...body, tfa_enforced: tfaEnforced })
      );
    }
  ),

  http.get('*/v4*/profile', () => {
    return makeResponse(withProfileTfaEnforced());
  }),

  http.get('*/v4*/profile/security-questions', () => {
    return makeResponse(getSecurityQuestionsResponse());
  }),

  http.post('*/v4*/profile/tfa-enable', () => {
    return makeResponse({
      expiry: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      secret: 'JBSWY3DPEHPK3PXP',
    });
  }),

  http.get('*/v4beta/account/tfa-optional-users', async ({ request }) => {
    const data = (await getOptionalUsernamesForAccount()).map(
      toTfaOptionalUser
    );

    return makePaginatedResponse({
      data,
      request,
    });
  }),

  http.put(
    '*/v4beta/account/tfa-optional-users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | UpdateTfaOptionalUsersResponse>
    > => {
      const body = (await request.json()) as UpdateTfaOptionalUsersPayload;
      const users = await getAccountUsers();
      const invalidUsernames = body.usernames.filter(
        (username) => !users.some((user) => user.username === username)
      );

      if (invalidUsernames.length > 0) {
        return makeErrorResponse(
          `Invalid username: ${invalidUsernames.join(', ')}`
        );
      }

      tfaEnforcementData = {
        ...getData(),
        tfaOptionalUsers: body.usernames,
      };

      const response: UpdateTfaOptionalUsersResponse = {
        tfa_optional_users_count: body.usernames.length,
        url: '/account/tfa-optional-users',
      };

      return makeResponse(response);
    }
  ),

  http.get(
    '*/v4*/account/users',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<User>>
    > => {
      const users = await getAccountUsers();
      const filteredUsers = await filterUsersByProfileType(users);

      return makePaginatedResponse({
        data: withUsersTfaEnforced(filteredUsers),
        request,
      });
    }
  ),

  http.get(
    '*/v4*/account/users/:username',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | User>> => {
      const username = params.username as string;
      const users = await getAccountUsers();
      const user = users.find((entry) => entry.username === username);

      if (!user) {
        return makeNotFoundResponse();
      }

      return makeResponse(withUserTfaEnforced(user));
    }
  ),
];

export const tfaEnforcementPreset: MockPresetExtra = {
  desc: 'Mocks Login Settings TFA + SSO/IDP IAM permissions, account settings/profile tfa_enforced and two_factor_auth, profile security questions, and tfa-optional-users. Use with Static Mocking: configure account enforcement, optional-user exemptions, and profile auth setup state separately.',
  group: { id: 'Account', type: 'account' },
  handlers: [mockTfaEnforcement],
  id: 'account:tfa-enforcement',
  label: '2FA Enforcement',
};
