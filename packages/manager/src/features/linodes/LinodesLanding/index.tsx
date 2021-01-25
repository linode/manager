import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { useTypes } from 'src/hooks/useTypes';

const LinodesLanding: React.FC<Props> = props => {
  const { _loading } = useReduxLoad(['linodes', 'images']);
  const { typesMap } = useTypes();

  return _loading ? (
    <CircleProgress />
  ) : (
    <_LinodesLanding {...props} linodeTypes={typesMap} />
  );
};

import _LinodesLanding, { Props } from './LinodesLanding';
export default LinodesLanding;
