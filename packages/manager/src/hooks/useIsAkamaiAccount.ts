import { useProfile } from '@linode/queries';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ProfileWithAkamaiAccountHeader as ProfileWithAkamaiAccountHeader } from 'src/request';

/**
 * NOTE: this won't work locally (only staging and prod allow this header)
 */
export const useIsAkamaiAccount = () => ({
  isAkamaiAccount:
    (useProfile() as UseQueryResult<ProfileWithAkamaiAccountHeader>).data
      ?._akamaiAccount ?? false,
});
