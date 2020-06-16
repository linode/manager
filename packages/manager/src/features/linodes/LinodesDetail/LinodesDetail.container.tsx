import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useLinodes } from 'src/hooks/useLinodes';
import CircleProgress from 'src/components/CircleProgress';
import LinodesDetail from './LinodesDetail';
import useReduxLoad from 'src/hooks/useReduxLoad';

/**
 * We want to hold off loading this screen until Linode data is available.
 * If we have recently requested all Linode data, we're good. If not,
 * we show a loading spinner until the request is complete.
 */
export const LinodesDetailContainer: React.FC<{}> = _ => {
  const { linodes, getLinode } = useLinodes();
  const params = useParams();
  const { _loading } = useReduxLoad(['images', 'volumes']);

  React.useEffect(() => {
    const linodeId = params.linodeId;
    if (!linodes.loading && linodes.lastUpdated === 0) {
      // We haven't requested Linodes yet. Ask for the one we're interested in.
      getLinode(linodeId);
    }
  }, []);

  if (linodes.loading || _loading) {
    return <CircleProgress />;
  }

  return <div>{JSON.stringify(linodes.itemsById[params.linodeId])}</div>;
};

export default React.memo(LinodesDetailContainer);
