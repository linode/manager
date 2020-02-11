import { Linode } from 'linode-js-sdk/lib/linodes/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { branch, compose, renderComponent } from 'recompose';
import NotFound from 'src/components/NotFound';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { findLinodeById } from 'src/store/linodes/linodes.selector';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { getTypeById } from 'src/store/linodeType/linodeType.selector';
import { getNotificationsForLinode } from 'src/store/notification/notification.selector';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';
import { ExtendedLinode } from './types';

interface OuterProps {
  linodeId: number;
  linode: Linode;
}

interface InnerProps {
  linode: ExtendedLinode;
}

export const mapStateToProps: MapStateToProps<
  InnerProps,
  OuterProps,
  ApplicationState
> = (state, ownProps) => {
  const { events, __resources } = state;
  const {
    volumes,
    notifications,
    types,
    linodeConfigs,
    linodeDisks,
    profile
  } = __resources;
  const { linode, linodeId } = ownProps;
  const { type } = linode;

  return {
    linode: {
      ...linode,
      _volumes: getVolumesForLinode(volumes.itemsById, linodeId),
      _volumesError: volumes.error ? volumes.error.read : undefined,
      _notifications: getNotificationsForLinode(notifications, linodeId),
      _type: getTypeById(types, type),
      _events: eventsForLinode(events, linodeId),
      _configs: getLinodeConfigsForLinode(linodeConfigs, linodeId),
      _disks: getLinodeDisksForLinode(linodeDisks, linodeId),
      _permissions: getPermissionsForLinode(
        pathOr(null, ['data'], profile),
        linodeId
      )
    }
  };
};

/**
 * Retrieve the Linode and its extended information from Redux.
 * If the Linode cannot be found, render the NotFound component. (early return)
 */
export default compose<InnerProps, OuterProps>(
  connect((state: ApplicationState, ownProps: OuterProps) => {
    const { linodeId } = ownProps;
    return {
      linode: findLinodeById(state.__resources.linodes, linodeId)
    };
  }),
  branch(
    /** If the Linode is found */
    ({ linode }) => Boolean(linode),

    /** Build the ExtendedLinode */
    compose<InnerProps, OuterProps>(connect(mapStateToProps)),

    /** Otherwise, render the NotFound component. */
    renderComponent(() => <NotFound />)
  )
);
