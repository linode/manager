import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

import { CANNOT_CREATE_VPC_MESSAGE } from '../../constants';

export const CannotCreateVPCNotice = () => {
  return (
    <Notice
      important
      spacingTop={16}
      text={`${CANNOT_CREATE_VPC_MESSAGE}`}
      variant="error"
    />
  );
};
