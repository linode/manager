import { Notice, Typography } from '@linode/ui';
import React from 'react';

import { localStorageWarning } from '../constants';

export const LocalStorageWarningNotice = () => {
  return (
    <Notice spacingTop={16} variant="warning">
      <Typography>
        <strong>Warning: </strong> {localStorageWarning} This operation is
        considered safe as using local storage for important data is not common
        or recommended.
      </Typography>
    </Notice>
  );
};
