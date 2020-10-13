import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useLinodes } from 'src/hooks/useLinodes';
import CircleProgress from 'src/components/CircleProgress';
import LinodesDetail from './LinodesDetail';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { getLinode as _getLinode } from 'src/store/linodes/linode.requests';
import { ApplicationState } from 'src/store';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { shouldRequestEntity } from 'src/utilities/shouldRequestEntity';

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
  const { configs, disks } = useSelector((state: ApplicationState) => {
    const disks = state.__resources.linodeDisks[linodeId];
    const configs = state.__resources.linodeConfigs[linodeId];
    return { disks, configs };
  });

  React.useEffect(() => {
    // Unconditionally request data for the Linode being viewed
    dispatch(_getLinode({ linodeId: +linodeId }));
  }, [linodeId, dispatch]);

  React.useEffect(() => {
    if (!linodes.itemsById[linodeId]) {
      // Most likely a 404
      return;
    }

    if (configs?.error.read || disks?.error.read) {
      // We don't want an infinite loop.
      return;
    }

    // Make sure we've requested config and disk information for this Linode
    if (shouldRequestEntity(configs)) {
      dispatch(getAllLinodeConfigs({ linodeId: +linodeId }));
    }

    if (shouldRequestEntity(disks)) {
      dispatch(getAllLinodeDisks({ linodeId: +linodeId }));
    }
  }, [dispatch, configs, disks, linodeId, linodes]);

  if ((linodes.lastUpdated === 0 && linodes.loading) || _loading) {
    return <CircleProgress />;
  }

  return (
    <LinodesDetail linodeId={linodeId} isDashboard={Boolean(isDashboard)} />
  );
};

export default React.memo(LinodesDetailContainer);
