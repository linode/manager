import { Notice } from '@linode/ui';
import React from 'react';

import { localStorageWarning } from '../constants';

interface Props {
  isRecycle?: boolean;
}

export const LocalStorageWarningNotice = (props: Props) => {
  const { isRecycle } = props;
  return (
    <Notice spacingTop={8} variant="warning">
      <strong>Warning:</strong> Compute Instances associated with these nodes
      will be deleted
      {isRecycle && ' and recreated'}. Since using local storage is not advised,
      this operation is generally safe. {localStorageWarning}
    </Notice>
  );
};
