import { getAccountRoles, getUserRoles } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export const iamQueries = createQueryKeys('iam', {
  user: (username: string) => ({
    contextQueries: {
      permissions: {
        queryFn: () => getUserRoles(username),
        queryKey: null,
      },
    },
    queryKey: [username],
  }),
  permissions: {
    queryFn: getAccountRoles,
    queryKey: null,
  },
});
