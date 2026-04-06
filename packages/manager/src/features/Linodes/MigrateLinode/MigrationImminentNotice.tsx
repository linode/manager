import { Notice } from '@linode/ui';
import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';

import type { Notification } from '@linode/api-v4/lib/account';

interface Props {
  className?: string;
  linodeID: number;
  notifications: Notification[];
}

export const MigrationImminentNotice = React.memo((props: Props) => {
  const migrationScheduledForThisLinode = !!props.notifications.find(
    (eachNotification) => {
      return (
        eachNotification.label.match(/migrat/i) &&
        eachNotification.entity &&
        eachNotification.entity.id === props.linodeID
      );
    }
  );

  return migrationScheduledForThisLinode ? (
    <Notice className={props.className} spacingTop={16} variant="warning">
      <React.Fragment>
        Your Linode is already scheduled to be migrated. Please open a{' '}
        <SupportLink
          text="support ticket"
          title="Request to overwrite existing migration"
        />{' '}
        if you would like to request this migration be overwritten.
      </React.Fragment>
    </Notice>
  ) : null;
});
