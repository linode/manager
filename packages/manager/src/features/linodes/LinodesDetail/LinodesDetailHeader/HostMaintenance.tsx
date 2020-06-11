import { LinodeStatus } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

interface Props {
  linodeStatus: LinodeStatus;
}

export type CombinedProps = Props;

export const HostMaintenance: React.FC<Props> = props => {
  const { linodeStatus } = props;
  if (linodeStatus !== 'stopped') {
    return null;
  }
  return (
    <Notice important warning>
      <Typography variant="h3" style={{ paddingBottom: '8px' }}>
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

export default HostMaintenance;
