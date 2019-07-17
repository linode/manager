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
  const recentEvent = linodeEvents[0];

  return (
    <React.Fragment>
      <MutationNotification disks={linodeDisks} />
      <Notifications />
      <LinodeControls />
      {linodeInTransition(linodeStatus, recentEvent) && <LinodeBusyStatus />}
    </React.Fragment>
  );
};

interface LinodeContext {
  linodeStatus: Linode.LinodeStatus;
  linodeEvents: Linode.Event[];
  linodeDisks: Linode.Disk[];
}

export default compose<CombinedProps, {}>(
  withLinodeDetailContext<LinodeContext>(({ linode }) => ({
    linodeStatus: linode.status,
    linodeEvents: linode._events,
    linodeDisks: linode._disks
  }))
)(LinodeDetailHeader);
