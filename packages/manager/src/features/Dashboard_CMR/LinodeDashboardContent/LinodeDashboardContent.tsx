import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import useLinodes from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
import SingleLinode from './SingleLinode';
import MultipleLinodes from './MultipleLinodes';

export const LinodeDashboardContent: React.FC<{}> = props => {
  const { linodes } = useLinodes();
  const { _loading } = useReduxLoad(['linodes']);

  if (_loading) {
    return <CircleProgress />;
  }

  // @todo change this logic once there's a no-Linodes view
  return linodes.results < 2 ? <SingleLinode /> : <MultipleLinodes />;
};

export default React.memo(LinodeDashboardContent);
