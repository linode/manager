import { Notice } from '@linode/ui';
import * as React from 'react';

import { CANNOT_CREATE_VPC_MESSAGE } from '../../constants';

export const CannotCreateVPCNotice = (
  <Notice
    spacingTop={16}
    text={`${CANNOT_CREATE_VPC_MESSAGE}`}
    variant="error"
  />
);
