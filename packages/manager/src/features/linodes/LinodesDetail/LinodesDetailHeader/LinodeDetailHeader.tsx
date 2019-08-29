import { Event } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import { compose } from 'recompose';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodeBusyStatus from '../LinodeSummary/LinodeBusyStatus';
import LinodeControls from './LinodeControls';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';

type CombinedProps = LinodeContext;

const LinodeDetailHeader: React.StatelessComponent<CombinedProps> = props => {
  const { linodeEvents, linodeStatus, linodeDisks } = props;
  const firstEventWithProgress = (linodeEvents || []).find(
    eachEvent => typeof eachEvent.percent_complete === 'number'
  );

  return (
    <React.Fragment>
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
  linodeStatus: Linode.LinodeStatus;
  linodeEvents: Event[];
  linodeDisks: Linode.Disk[];
}

export default compose<CombinedProps, {}>(
  withLinodeDetailContext<LinodeContext>(({ linode }) => ({
    linodeStatus: linode.status,
    linodeEvents: linode._events,
    linodeDisks: linode._disks
  }))
)(LinodeDetailHeader);
