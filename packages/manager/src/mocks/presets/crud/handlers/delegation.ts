import { http } from 'msw';

import { accountFactory } from 'src/factories/account';
import { mswDB } from 'src/mocks/indexedDB';
import {
  makeNotFoundResponse,
  makePaginatedResponse,
  makeResponse,
} from 'src/mocks/utilities/response';

import type {
  Account,
  ChildAccount,
  IamUserRoles,
  Token,
} from '@linode/api-v4';
import type { StrictResponse } from 'msw';
import type { MockState } from 'src/mocks/types';
import type {
  APIErrorResponse,
  APIPaginatedResponse,
} from 'src/mocks/utilities/response';

export const getChildAccounts = () => [
  http.get(
    '*/v4*/iam/delegation/child-accounts*',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<ChildAccount>>
    > => {
      const childAccounts = await mswDB.getAll('childAccounts');
      const delegations = await mswDB.getAll('delegations');

      if (!childAccounts || !delegations) {
        return makeNotFoundResponse();
      }

      return makePaginatedResponse({
        data: childAccounts.map((account) => ({
          ...account,
          users: delegations
            .filter((d) => d.childAccountEuuid === account.euuid)
            .map((d) => d.username),
        })),
        request,
      });
    }
  ),

  http.get(
    '*/v4*/iam/delegation/child-accounts/:id',
    async ({
      params,
    }): Promise<StrictResponse<APIErrorResponse | ChildAccount>> => {
      const id = Number(params.id);
      const entity = await mswDB.get('childAccounts', id);

      if (!entity) {
        return makeNotFoundResponse();
      }

      return makeResponse(entity);
    }
  ),
];

export const getDelegatedChildAccountsForUser = () => [
  http.get(
    '*/v4*/iam/delegation/users/:username/child-accounts',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<ChildAccount>>
    > => {
      const username = params.username;
      const delegations = await mswDB.getAll('delegations');
      const childAccounts = await mswDB.getAll('childAccounts');

      if (!childAccounts || !delegations) {
        return makeNotFoundResponse();
      }

      const userDelegations = delegations.filter(
        (d) => d.username === username
      );

      return makePaginatedResponse({
        data: childAccounts.filter((account) =>
          userDelegations.some((d) => d.childAccountEuuid === account.euuid)
        ),
        request,
      });
    }
  ),
];

export const childAccountDelegates = (mockState: MockState) => [
  http.get(
    '*/v4*/iam/delegation/child-accounts/:euuid/users',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<string>>
    > => {
      const euuid = params.euuid as string;
      const delegations = await mswDB.getAll('delegations');

      if (!delegations) {
        return makeNotFoundResponse();
      }

      // Get all usernames delegated to this specific child account
      const delegateUsernames = delegations
        .filter((d) => d.childAccountEuuid === euuid)
        .map((d) => d.username);

      return makePaginatedResponse({
        data: delegateUsernames,
        request,
      });
    }
  ),

  http.put(
    '*/v4*/iam/delegation/child-accounts/:euuid/users',
    async ({
      params,
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<string>>
    > => {
      const euuid = params.euuid as string;
      const requestData = (await request.json()) as { users: string[] };
      const newUsernames = requestData?.users || [];

      // Get current delegations
      const allDelegations = await mswDB.getAll('delegations');
      if (!allDelegations) {
        return makeNotFoundResponse();
      }

      // Find and delete delegations for this child account
      const delegationsToDelete = allDelegations.filter(
        (d) => d.childAccountEuuid === euuid
      );

      for (const delegation of delegationsToDelete) {
        await mswDB.delete('delegations', delegation.id, mockState);
      }

      // Add new delegations
      for (const username of newUsernames) {
        await mswDB.add(
          'delegations',
          {
            childAccountEuuid: euuid,
            username,
            id: Math.floor(Math.random() * 1000000),
          },
          mockState
        );
      }

      return makePaginatedResponse({
        data: newUsernames,
        request,
      });
    }
  ),
];

export const delegatedChildAccounts = () => [
  http.get(
    '*/v4*/iam/delegation/profile/child-accounts',
    async ({
      request,
    }): Promise<
      StrictResponse<APIErrorResponse | APIPaginatedResponse<Account>>
    > => {
      // For mocking purposes, we'll simulate getting the current user's delegated accounts
      // In real implementation, this would use authentication context
      const delegations = await mswDB.getAll('delegations');
      const childAccounts = await mswDB.getAll('childAccounts');

      if (!childAccounts) {
        return makeNotFoundResponse();
      }

      const allDelegations = await mswDB.getAll('delegations');
      const mockCurrentUser = allDelegations?.[0]?.username || 'mockuser';
      const userDelegations = delegations?.filter(
        (d) => d.username === mockCurrentUser
      );

      const delegatedAccounts = childAccounts
        .filter((account) =>
          userDelegations?.some((d) => d.childAccountEuuid === account.euuid)
        )
        .map((childAccount) => ({
          ...accountFactory.build({
            company: childAccount.company,
            euuid: childAccount.euuid,
          }),
          ...childAccount,
        }));

      return makePaginatedResponse({
        data: delegatedAccounts,
        request,
      });
    }
  ),

  http.get(
    '*/v4*/iam/delegation/profile/child-accounts/:euuid',
    async ({ params }): Promise<StrictResponse<Account | APIErrorResponse>> => {
      const euuid = params.euuid as string;
      const childAccount = await mswDB.getAll('childAccounts');

      if (!childAccount) {
        return makeNotFoundResponse();
      }

      const account = childAccount.find((acc) => acc.euuid === euuid);

      if (!account) {
        return makeNotFoundResponse();
      }

      // Convert ChildAccount to full Account
      const fullAccount = {
        ...accountFactory.build({
          company: account.company,
          euuid: account.euuid,
        }),
        ...account,
      };

      return makeResponse(fullAccount);
    }
  ),
];

export const generateChildAccountToken = () => [
  http.post(
    '*/v4*/iam/delegation/profile/child-accounts/:euuid/token',
    async ({ params }): Promise<StrictResponse<APIErrorResponse | Token>> => {
      const euuid = params.euuid as string;

      // Verify the child account exists
      const childAccounts = await mswDB.getAll('childAccounts');
      if (!childAccounts?.some((acc) => acc.euuid === euuid)) {
        return makeNotFoundResponse();
      }

      // Generate mock token
      const mockToken: Token = {
        id: Math.floor(Math.random() * 10000),
        created: new Date().toISOString(),
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        label: `Child Account Token - ${euuid}`,
        scopes: '*',
        token: `mock_token_${euuid}_${Date.now()}`,
      };

      return makeResponse(mockToken);
    }
  ),
];

export const defaultDelegationAccess = () => [
  http.get(
    '*/v4*/iam/delegation/default-role-permissions',
    async (): Promise<StrictResponse<APIErrorResponse | IamUserRoles>> => {
      // Mock default delegation access
      const mockDefaultAccess: IamUserRoles = {
        account_access: [
          'account_linode_admin',
          'account_linode_creator',
          'account_firewall_creator',
        ],
        entity_access: [
          {
            id: 12345678,
            type: 'linode' as const,
            roles: ['linode_contributor'],
          },
          {
            id: 45678901,
            type: 'firewall' as const,
            roles: ['firewall_admin'],
          },
        ],
      };

      return makeResponse(mockDefaultAccess);
    }
  ),

  http.put(
    '*/v4*/iam/delegation/default-role-permissions',
    async ({
      request,
    }): Promise<StrictResponse<APIErrorResponse | IamUserRoles>> => {
      const requestData = (await request.json()) as IamUserRoles;

      // In a real implementation, you'd validate and store this
      // For mocking, just return what was sent
      return makeResponse(requestData);
    }
  ),
];
