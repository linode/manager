import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

export const CannotCreateVPCNotice = () => {
  return (
    <Notice
      text={
        "You don't have permissions to create a new VPC. Please contact an account administrator for details."
      }
      important
      spacingTop={16}
      variant="error"
    />
  );
};
