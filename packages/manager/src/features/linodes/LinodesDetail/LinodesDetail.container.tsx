import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { useLinodes } from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getAllLinodeInterfaces } from 'src/store/linodes/interfaces/interfaces.requests';
import { getLinode as _getLinode } from 'src/store/linodes/linode.requests';
import { shouldRequestEntity } from 'src/utilities/shouldRequestEntity';
import LinodesDetail from './LinodesDetail';

interface Props {
  linodeId?: string;
  isDashboard?: boolean;
}

/**
 * We want to hold off loading this screen until Linode data is available.
 * If we have recently requested all Linode data, we're good. If not,
 * we show a loading spinner until the requests are complete.
 */
export const LinodesDetailContainer: React.FC<Props> = props => {
  const { isDashboard } = props;
  const { linodes } = useLinodes();
  const dispatch = useDispatch();
  const params = useParams<{ linodeId: string }>();
  const linodeId = props.linodeId ? props.linodeId : params.linodeId;

  const { _loading } = useReduxLoad(['images', 'volumes']);
  const { configs, disks, interfaces } = useSelector(
    (state: ApplicationState) => {
      const disks = state.__resources.linodeDisks[linodeId];
      const configs = state.__resources.linodeConfigs[linodeId];
      const interfaces = state.__resources.interfaces[linodeId];
      return { disks, configs, interfaces };
    }
  );

  React.useEffect(() => {
    // Unconditionally request data for the Linode being viewed
    dispatch(_getLinode({ linodeId: +linodeId }));
  }, [linodeId, dispatch]);

  React.useEffect(() => {
    if (!linodes.itemsById[linodeId]) {
      // Most likely a 404
      return;
    }

    if (configs?.error.read || disks?.error.read || interfaces?.error.read) {
      // We don't want an infinite loop.
      return;
    }

    // Make sure we've requested config, disk, and interface information for this Linode
    if (shouldRequestEntity(configs)) {
      dispatch(getAllLinodeConfigs({ linodeId: +linodeId }));
    }

    if (shouldRequestEntity(disks)) {
      dispatch(getAllLinodeDisks({ linodeId: +linodeId }));
    }

    if (shouldRequestEntity(interfaces)) {
      dispatch(getAllLinodeInterfaces({ linodeId: +linodeId }));
    }
  }, [dispatch, configs, disks, interfaces, linodeId, linodes]);

  if ((linodes.lastUpdated === 0 && linodes.loading) || _loading) {
    return <CircleProgress />;
  }

  return (
    <LinodesDetail linodeId={linodeId} isDashboard={Boolean(isDashboard)} />
  );
};

export default React.memo(LinodesDetailContainer);
