import { Notification } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { compose } from 'recompose';

import Notice from 'src/components/Notice';
import SupportLink from 'src/components/SupportLink';

interface Props {
  notifications: Notification[];
  linodeID: number;
  className?: string;
}
type CombinedProps = Props;

const MigrationImminentNotice: React.FC<CombinedProps> = (props) => {
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
    <Notice className={props.className} spacingTop={16} warning>
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
};

export default compose<CombinedProps, Props>(React.memo)(
  MigrationImminentNotice
);
