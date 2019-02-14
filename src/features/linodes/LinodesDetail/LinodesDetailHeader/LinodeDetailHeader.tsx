import * as React from 'react';
import { linodeInTransition } from 'src/features/linodes/transitions';
import {
  LinodeDetailContext,
  withLinodeDetailContext
} from '../linodeDetailContext';
import LinodeBusyStatus from '../LinodeSummary/LinodeBusyStatus';
import LinodeControls from './LinodeControls';
import MutationNotification from './MutationNotification';
import Notifications from './Notifications';

type CombinedProps = LinodeDetailContext;

const LinodeDetailHeader: React.StatelessComponent<CombinedProps> = props => {
  const { linode } = props;
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

export default withLinodeDetailContext(context => context)(LinodeDetailHeader);
