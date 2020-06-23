import { Event } from '@linode/api-v4/lib/account';
import { Disk, LinodeStatus } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodeBusyStatus from '../LinodeSummary/LinodeBusyStatus';
import HostMaintenance from './HostMaintenance';
import LinodeControls from './LinodeControls';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';

type CombinedProps = LinodeContext;

const LinodeDetailHeader: React.FC<CombinedProps> = props => {
  const { linodeEvents, linodeStatus, linodeDisks } = props;
  const firstEventWithProgress = (linodeEvents || []).find(
    eachEvent => typeof eachEvent.percent_complete === 'number'
  );

  return (
    <React.Fragment>
      <HostMaintenance linodeStatus={linodeStatus} />
      <MutationNotification disks={linodeDisks} />
      <Notifications />
      <LinodeControls />
      {linodeInTransition(linodeStatus, firstEventWithProgress) && (
        <LinodeBusyStatus />
      )}
    </React.Fragment>
  );
};

interface LinodeContext {
  linodeStatus: LinodeStatus;
  linodeEvents: Event[];
  linodeDisks: Disk[];
}

export default compose<CombinedProps, {}>(
  withLinodeDetailContext<LinodeContext>(({ linode }) => ({
    linodeStatus: linode.status,
    linodeEvents: linode._events,
    linodeDisks: linode._disks
  }))
)(LinodeDetailHeader);
