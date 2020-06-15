import { Linode } from '@linode/api-v4/lib/linodes/types';
import { pathOr } from 'ramda';
import { connect, MapStateToProps } from 'react-redux';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
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
  const { linodeId } = ownProps;
  const linode = state.__resources.linodes.itemsById[linodeId];
  if (!linode) {
    return { linode: undefined };
  }
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

export default connect(mapStateToProps);
