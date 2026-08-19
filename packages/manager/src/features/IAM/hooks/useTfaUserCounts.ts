import { useAccountUsers, useGetTfaOptionalUsersQuery } from '@linode/queries';

interface UseTfaUserCountsResult {
  enforcedUsersCount: number;
  isError: boolean;
  isLoading: boolean;
  optionalUsersCount: number;
  totalUsers: number;
}

/**
 * Returns user counts relevant to the 2FA enforcement summary.
 * Both queries fetch only `page_size: 25` (API minimum) to retrieve the total count cheaply.
 *
 * @param isEnforced - Current form value of the enforcement toggle. When
 * `false`, `enforcedUsersCount` is 0 (reflects what will happen after save).
 */
export const useTfaUserCounts = (
  isEnforced: boolean
): UseTfaUserCountsResult => {
  const {
    data: allUsersData,
    isLoading: isAllUsersLoading,
    isError: isAllUsersError,
  } = useAccountUsers({
    params: { page_size: 25 },
  });
  const {
    data: tfaOptionalUsersData,
    isLoading: isTfaOptionalUsersLoading,
    isError: isTfaOptionalUsersError,
  } = useGetTfaOptionalUsersQuery({
    page_size: 25,
  });

  const isLoading = isAllUsersLoading || isTfaOptionalUsersLoading;
  const isError = isAllUsersError || isTfaOptionalUsersError;
  const totalUsers = allUsersData?.results ?? 0;
  const optionalUsersCount = tfaOptionalUsersData?.results ?? 0;
  const enforcedUsersCount =
    isEnforced && !isLoading ? totalUsers - optionalUsersCount : 0;

  return {
    enforcedUsersCount,
    isLoading,
    optionalUsersCount,
    totalUsers,
    isError,
  };
};
