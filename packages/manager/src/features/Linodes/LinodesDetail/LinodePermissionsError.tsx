import { Notice } from '@linode/ui';
import * as React from 'react';

import { getRestrictedResourceText } from 'src/features/Account/utils';

export const LinodePermissionsError = () => (
  <Notice
    text={getRestrictedResourceText({
      resourceType: 'Linodes',
    })}
    variant="error"
  />
);
