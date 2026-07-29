import { iamQueries, profileQueries } from '@linode/queries';
import { queryOptions } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';

import { LAUNCH_DARKLY_API_KEY } from 'src/constants';
import { featureFlagClient } from 'src/featureFlags';

import type { FlagSet } from 'src/featureFlags';
import type { RouterContext } from 'src/routes/types';

const getIamFlagEnabled = (flags: FlagSet): boolean | undefined => {
  const enabled = flags?.iam?.enabled;

  if (enabled === true || enabled === false) {
    return enabled;
  }

  return undefined;
};

/**
 * Router beforeLoad can run before LD identify finishes on cold start.
 * Subscribe only when the IAM flag is still unknown — no timeout, IAM routes only.
 */
const waitForIamFlagEnabled = (contextFlags: FlagSet): Promise<boolean> => {
  const known =
    getIamFlagEnabled(contextFlags) ??
    getIamFlagEnabled(featureFlagClient.getFlags() ?? {});

  if (known !== undefined) {
    return Promise.resolve(known);
  }

  if (!LAUNCH_DARKLY_API_KEY) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const unsubscribe = featureFlagClient.subscribe((flags) => {
      const value = getIamFlagEnabled(flags);

      if (value !== undefined) {
        unsubscribe();
        resolve(value);
      }
    });
  });
};

/** Resolves whether the current user should use IAM (flag + API probe). */
export const resolveIsIAMEnabled = async ({
  queryClient,
  flags,
  profile,
}: Pick<
  RouterContext,
  'flags' | 'profile' | 'queryClient'
>): Promise<boolean> => {
  const resolvedProfile =
    profile ??
    (await queryClient
      .ensureQueryData(queryOptions(profileQueries.profile()))
      .catch(() => undefined));

  if (!resolvedProfile || !(await waitForIamFlagEnabled(flags))) {
    return false;
  }

  try {
    if (resolvedProfile.username) {
      const permissions = await queryClient.ensureQueryData(
        queryOptions(
          iamQueries.user(resolvedProfile.username)._ctx.accountPermissions
        )
      );
      return Boolean(permissions);
    }

    const roles = await queryClient.ensureQueryData(
      queryOptions(iamQueries.accountRoles)
    );

    return Boolean(roles);
  } catch {
    return false;
  }
};

const redirectToIamUser = (pathname: string, username: string) => {
  throw redirect({
    to: pathname.endsWith('/permissions')
      ? '/iam/users/$username/roles'
      : '/iam/users/$username/details',
    params: { username },
    replace: true,
  });
};

/** Guard for `/iam/*` — redirects legacy users to `/users`. */
export const requireIamAccess = async (context: RouterContext) => {
  if (!(await resolveIsIAMEnabled(context))) {
    throw redirect({ to: '/users', replace: true });
  }
};

/** Guard for legacy `/users/*` — redirects IAM users to the matching IAM route. */
export const redirectLegacyUsersToIam = async (
  context: RouterContext,
  pathname: string
) => {
  if (!(await resolveIsIAMEnabled(context))) {
    return;
  }

  if (pathname === '/users' || pathname === '/users/') {
    throw redirect({ to: '/iam/users', replace: true });
  }

  const match = pathname.match(/^\/users\/([^/]+)/);

  if (match) {
    redirectToIamUser(pathname, match[1]);
  }
};

/** Guard for legacy `/account/users` — redirects IAM users to `/iam/users`. */
export const redirectAccountUsersListToIam = async (context: RouterContext) => {
  if (await resolveIsIAMEnabled(context)) {
    throw redirect({ to: '/iam/users' });
  }
};

/** Guard for legacy `/account/users/$username` — redirects IAM users to IAM user routes. */
export const redirectAccountUsersToIam = async (
  context: RouterContext,
  pathname: string,
  username: string | undefined
) => {
  if (!username || !(await resolveIsIAMEnabled(context))) {
    return;
  }

  redirectToIamUser(pathname, username);
};
