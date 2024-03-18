import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { getRestrictedResourceText } from 'src/features/Account/utils';

export const LinodePermissionsError = () => (
  <Notice
    text={getRestrictedResourceText({
      resourceType: 'Linodes',
    })}
    variant="error"
  />
);
