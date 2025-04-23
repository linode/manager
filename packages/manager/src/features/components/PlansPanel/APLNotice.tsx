import { Notice } from '@linode/ui';
import * as React from 'react';

import { APL_NOTICE_COPY } from './constants';

interface Props {
  dataTestId?: string;
}

export const APLNotice = (props: Props) => {
  const { dataTestId } = props;

  return (
    <Notice dataTestId={dataTestId} variant="error">
      {APL_NOTICE_COPY}
    </Notice>
  );
};
