import { UserType } from '@linode/api-v4/lib/account';

import {
  ADMINISTRATOR,
  BUSINESS_PARTNER,
} from 'src/features/Account/constants';

export const getRestrictedAccessMessage = (userType: UserType) => {
  if (userType === 'parent') {
    return `Access restricted. Please contact your ${BUSINESS_PARTNER} to request the necessary permissions.`;
  }

  return `Access restricted. Please contact your ${ADMINISTRATOR} to request the necessary permissions.`;
};
