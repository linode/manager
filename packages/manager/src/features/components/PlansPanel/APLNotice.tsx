import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';

interface Props {
  dataTestId?: string;
}

const programInfo = `Shared CPU instances are currently not available for Application Platform for LKE`;

export const APLNotice = (props: Props) => {
  const { dataTestId } = props;

  return (
    <Notice dataTestId={dataTestId} variant="error">
      {programInfo}
    </Notice>
  );
};
