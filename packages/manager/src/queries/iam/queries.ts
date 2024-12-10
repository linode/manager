import { getUserPermissions, getAccountPermissions } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export const iamQueries = createQueryKeys('iam', {
  user: (username: string) => ({
    contextQueries: {
      permissions: {
        queryFn: () => getUserPermissions(username),
        queryKey: null,
      },
    },
    queryKey: [username],
  }),
  permissions: {
    queryFn: getAccountPermissions,
    queryKey: null,
  },
});
