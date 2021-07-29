import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import { useLinodes } from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { ApplicationState } from 'src/store';
import { getAllLinodeConfigs } from 'src/store/linodes/config/config.requests';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getLinode as _getLinode } from 'src/store/linodes/linode.requests';
import { ThunkDispatch } from 'src/store/types';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { shouldRequestEntity } from 'src/utilities/shouldRequestEntity';
import LinodesDetail from './LinodesDetail';

interface Props {
  linodeId?: string;
}

/**
 * We want to hold off loading this screen until Linode data is available.
 * If we have recently requested all Linode data, we're good. If not,
 * we show a loading spinner until the requests are complete.
 */
export const LinodesDetailContainer: React.FC<Props> = (props) => {
  const { linodes } = useLinodes();
  const dispatch = useDispatch<ThunkDispatch>();
  const flags = useFlags();
  const { account } = useAccountManagement();

  const params = useParams<{ linodeId: string }>();
  const linodeId = props.linodeId ? props.linodeId : params.linodeId;

  const { _loading } = useReduxLoad(['images', 'volumes']);
  const { configs, disks } = useSelector((state: ApplicationState) => {
    const disks = state.__resources.linodeDisks[linodeId];
    const configs = state.__resources.linodeConfigs[linodeId];
    return { disks, configs };
  });

  const vlansEnabled = isFeatureEnabled(
    'Vlans',
    Boolean(flags.vlans),
    account?.capabilities ?? []
  );

  React.useEffect(() => {
    // Unconditionally request data for the Linode being viewed
    dispatch(_getLinode({ linodeId: +linodeId })).catch((_) => null);
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

    // Make sure we've requested config, disk, and interface information for this Linode
    if (shouldRequestEntity(configs)) {
      dispatch(getAllLinodeConfigs({ linodeId: +linodeId }));
    }

    if (shouldRequestEntity(disks)) {
      dispatch(getAllLinodeDisks({ linodeId: +linodeId }));
    }
  }, [dispatch, configs, disks, vlansEnabled, linodeId, linodes]);

  if ((linodes.lastUpdated === 0 && linodes.loading) || _loading) {
    return <CircleProgress />;
  }

  return <LinodesDetail linodeId={linodeId} />;
};

export default React.memo(LinodesDetailContainer);
