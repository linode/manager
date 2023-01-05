import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { useAllImagesQuery } from 'src/queries/images';

const LinodesLanding: React.FC<Props> = (props) => {
  const { _loading } = useReduxLoad(['linodes']);
  const { isLoading } = useAllImagesQuery();

  return _loading || isLoading ? (
    <CircleProgress />
  ) : (
    <_LinodesLanding {...props} />
  );
};

import _LinodesLanding, { Props } from './LinodesLanding';
export default LinodesLanding;
