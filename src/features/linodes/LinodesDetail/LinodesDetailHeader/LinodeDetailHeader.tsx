import * as React from 'react';
import { linodeInTransition } from 'src/features/linodes/transitions';
import linodeDetailContext from '../context';
import LinodeBusyStatus from '../LinodeSummary/LinodeBusyStatus';
import LinodeControls from './LinodeControls';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';

const LinodeDetailHeader: React.StatelessComponent<{}> = props => {
  const { linode } = React.useContext(linodeDetailContext);
  const { status, _events } = linode;
  const recentEvent = _events[0];

  return (
    <React.Fragment>
      <MutationNotification />
      <Notifications />
      <LinodeControls />
      {linodeInTransition(status, recentEvent) && <LinodeBusyStatus />}
    </React.Fragment>
  );
};

export default LinodeDetailHeader;
