import { Notice } from '@linode/ui';
import * as React from 'react';

import { APL_NOTICE_COPY } from './constants';

interface Props {
  dataTestId?: string;
}

const programInfo = APL_NOTICE_COPY;

export const APLNotice = (props: Props) => {
  const { dataTestId } = props;

  return (
    <Notice dataTestId={dataTestId} variant="error">
      {programInfo}
    </Notice>
  );
};
