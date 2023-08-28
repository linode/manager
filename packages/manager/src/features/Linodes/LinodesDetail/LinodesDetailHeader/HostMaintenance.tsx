import { LinodeStatus } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';

interface Props {
  linodeStatus: LinodeStatus;
}

export const HostMaintenance = (props: Props) => {
  const { linodeStatus } = props;
  if (linodeStatus !== 'stopped') {
    return null;
  }
  return (
    <Notice important variant="warning">
      <Typography style={{ paddingBottom: '8px' }} variant="h3">
        <strong>
          An issue affecting the physical host this Linode resides on has been
          detected.
        </strong>
      </Typography>
      <Typography variant="body1">
        We are working to resolve the issue as quickly as possible and will
        update you as soon as we have more information. Your Linode will return
        to its previous state once the issue is resolved. Thank you for your
        patience and understanding.
      </Typography>
    </Notice>
  );
};
