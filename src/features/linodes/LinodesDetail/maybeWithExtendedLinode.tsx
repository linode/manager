import * as React from 'react';
import { connect } from 'react-redux';
import { branch, compose, renderComponent } from 'recompose';
import NotFound from 'src/components/NotFound';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { findLinodeById } from 'src/store/linodes/linodes.selector';
import { getTypeById } from 'src/store/linodeType/linodeType.selector';
import { getNotificationsForLinode } from 'src/store/notification/notification.selector';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import { ExtendedLinode } from './types';

interface OutterProps {
  linodeId: number;
}

interface InnerProps {
  linode: ExtendedLinode;
}

/**
 * Retrieve the Linode any it's extended information from Redux.
 * If the Linode cannot be found, render the NotFound component. (early return)
 */
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
      const {
        volumes,
        notifications,
        types,
        linodeConfigs,
        linodeDisks
      } = __resources;
      const { linode, linodeId } = ownProps;
      const { type } = linode;

      return {
        linode: {
          ...linode,
          _volumes: getVolumesForLinode(volumes, linodeId),
          _notifications: getNotificationsForLinode(notifications, linodeId),
          _type: getTypeById(types, type),
          _events: eventsForLinode(events, linodeId),
          _configs: getLinodeConfigsForLinode(linodeConfigs, linodeId),
          _disks: getLinodeDisksForLinode(linodeDisks, linodeId)
        }
      };
    }),

    /** Otherwise, render the NotFound component. */
    renderComponent(() => <NotFound />)
  )
);
