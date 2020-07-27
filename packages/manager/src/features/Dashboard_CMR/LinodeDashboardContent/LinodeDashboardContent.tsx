import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import useLinodes from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
import SingleLinode from './SingleLinode';
import MultipleLinodes from './MultipleLinodes';

export const LinodeDashboardContent: React.FC<{}> = _ => {
  const { linodes } = useLinodes();
  const { _loading } = useReduxLoad(['linodes']);

  if (_loading) {
    return <CircleProgress />;
  }

  // @todo change this logic once there's a no-Linodes view
  return (
    <div style={{ minHeight: 1500 }}>
      {linodes.results === 1 ? <SingleLinode /> : <MultipleLinodes />}
    </div>
  );
};

export default React.memo(LinodeDashboardContent);
