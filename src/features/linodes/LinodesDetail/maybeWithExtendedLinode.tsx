import * as React from 'react';
import { connect } from 'react-redux';
import { branch, compose, renderComponent } from 'recompose';
import NotFound from 'src/components/NotFound';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { findLinodeById } from 'src/store/linodes/linodes.selector';
import { getTypeById } from 'src/store/linodeType/linodeType.selector';
import { getNotificationsForLinode } from 'src/store/notification/notification.selector';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';

export interface ExtendedLinode extends Linode.Linode {
  _configs: Linode.Config[];
  _disks: Linode.Disk[];
  _events: Linode.Event[];
  _notifications: Linode.Notification[];
  _volumes: Linode.Volume[];
  _type?: null | Linode.LinodeType;
}

interface OutterProps {
  linodeId: number;
}

interface InnerProps {
  linode: ExtendedLinode;
}

export default compose<InnerProps, OutterProps>(
  connect((state: ApplicationState, ownProps: OutterProps) => {
    const { linodeId } = ownProps;
    return {
      linode: findLinodeById(state.__resources.linodes, linodeId)
    };
  }),
  branch(
    /** If the LInode is found */
    ({ linode }) => Boolean(linode),

    /** Build the ExtendedLinode */
    connect((state: ApplicationState, ownProps) => {
      const { events, __resources } = state;
      const { volumes, notifications, types } = __resources;
      const { linode, linodeId, configsData, disksData } = ownProps;
      const { type } = linode;

      return {
        linode: {
          ...linode,
          _volumes: getVolumesForLinode(volumes, linodeId),
          _notifications: getNotificationsForLinode(notifications, linodeId),
          _type: getTypeById(types, type),
          _events: eventsForLinode(events, linodeId),
          _configs: configsData,
          _disks: disksData
        }
      };
    }),

    /** Otherwise, render the NotFound component. */
    renderComponent(() => <NotFound />)
  )
);
