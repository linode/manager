import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useLinodes } from 'src/hooks/useLinodes';
import CircleProgress from 'src/components/CircleProgress';
import LinodesDetail from './LinodesDetail';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { getLinode as _getLinode } from 'src/store/linodes/linode.requests';

/**
 * We want to hold off loading this screen until Linode data is available.
 * If we have recently requested all Linode data, we're good. If not,
 * we show a loading spinner until the request is complete.
 */
export const LinodesDetailContainer: React.FC<{}> = _ => {
  const { linodes } = useLinodes();
  const dispatch = useDispatch();
  const params = useParams<{ linodeId: string }>();
  const { _loading } = useReduxLoad(['images', 'volumes']);

  const linodeId = params.linodeId;
  React.useEffect(() => {
    dispatch(_getLinode({ linodeId: +linodeId }));
  }, [linodeId, dispatch]);

  if (linodes.loading || _loading) {
    return <CircleProgress />;
  }

  return <LinodesDetail linodeId={linodeId} />;
};

export default React.memo(LinodesDetailContainer);
