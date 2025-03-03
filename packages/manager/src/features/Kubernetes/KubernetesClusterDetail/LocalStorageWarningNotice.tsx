import { Notice } from '@linode/ui';
import React from 'react';

import { localStorageWarning } from '../constants';

interface Props {
  isRecycle?: boolean;
  isSingular?: boolean;
}

export const LocalStorageWarningNotice = (props: Props) => {
  const { isRecycle, isSingular } = props;
  return (
    <Notice spacingTop={12} variant="warning">
      <strong>Warning:</strong>{' '}
      {isSingular ? 'The Compute Instance' : 'Compute Instances'} associated
      with {isSingular ? 'this node' : 'these nodes'} will be deleted
      {isRecycle && ' and recreated'}. Since using local storage is not advised,
      this operation is generally safe. {localStorageWarning}
    </Notice>
  );
};
