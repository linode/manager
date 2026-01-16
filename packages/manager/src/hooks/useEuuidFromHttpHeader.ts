import { useProfile } from '@linode/queries';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ProfileWithEuuid } from 'src/request';

/**
 * Hook to get the customer EUUID (Enterprise UUID) from the profile data.
 * The EUUID is injected by the injectEuuidToProfile interceptor from the
 * X-Customer-Uuid header.
 *
 * NOTE: this won't work locally (only staging and prod return this header)
 */
export const useEuuidFromHttpHeader = () => ({
  euuid: (useProfile() as UseQueryResult<ProfileWithEuuid>).data
    ?._euuidFromHttpHeader,
});
