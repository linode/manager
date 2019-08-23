import * as React from 'react';
import { compose } from 'recompose';

import Notice from 'src/components/Notice';
import SupportLink from 'src/components/SupportLink';

interface Props {
  notifications: Linode.Notification[];
  linodeID: number;
  className?: string;
}
type CombinedProps = Props;

const MigrationImminentNotice: React.FC<CombinedProps> = props => {
  const migrationScheduledForThisLinode = !!props.notifications.find(
    eachNotification => {
      return (
        eachNotification.label.match(/migrat/i) &&
        eachNotification.entity &&
        eachNotification.entity.id === props.linodeID
      );
    }
  );

  return (
    <React.Fragment>
      {migrationScheduledForThisLinode ? (
        <Notice
          className={props.className}
          spacingTop={16}
          warning
          text={
            <React.Fragment>
              Your Linode is already scheduled to be migrated. Please open a{' '}
              <SupportLink
                text="support ticket"
                title="Request to overwrite existing migration"
              />{' '}
              if you would like to request this migration be overwritten.
            </React.Fragment>
          }
        />
      ) : null}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(
  MigrationImminentNotice
);
