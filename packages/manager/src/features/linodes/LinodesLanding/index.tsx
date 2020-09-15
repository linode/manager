import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { useReduxLoad } from 'src/hooks/useReduxLoad';

interface Props {
  isDashboard?: boolean;
}

const LinodesLanding: React.FC<Props> = props => {
  const { _loading } = useReduxLoad(['linodes', 'images']);
  return _loading ? (
    <CircleProgress />
  ) : (
    <_LinodesLanding isDashboard={props.isDashboard} />
  );
};

import _LinodesLanding from './LinodesLanding';
export default LinodesLanding;
