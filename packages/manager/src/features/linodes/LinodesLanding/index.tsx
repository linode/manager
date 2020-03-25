import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { useReduxLoad } from 'src/hooks/useReduxLoad';

const LinodesLanding: React.FC<{}> = _ => {
  const { _loading } = useReduxLoad(['linodes', 'images']);
  return _loading ? <CircleProgress /> : <_LinodesLanding />;
};

import _LinodesLanding from './LinodesLanding';
export default LinodesLanding;
