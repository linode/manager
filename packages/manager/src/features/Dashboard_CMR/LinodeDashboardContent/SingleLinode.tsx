import * as React from 'react';
import LinodeDetail from 'src/features/linodes/LinodesDetail';

export const SingleLinode: React.FC<{}> = props => {
  return <LinodeDetail linodeId={21280784} />;
};

export default React.memo(SingleLinode);
