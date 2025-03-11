import { useProfile } from '@linode/queries';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ProfileWithAkamaiAccountHeader as ProfileWithAkamaiAccountHeader } from 'src/request';

export const useIsAkamaiAccount = () => ({
  isAkamaiAccount:
    (useProfile() as UseQueryResult<ProfileWithAkamaiAccountHeader>).data
      ?._akamaiAccount ?? false,
});
