import * as React from 'react';
import LinodeDetail from 'src/features/linodes/LinodesDetail';
import useLinodes from 'src/hooks/useLinodes';

export const SingleLinode: React.FC<{}> = _ => {
  const { linodes } = useLinodes();
  // We've already loaded Linodes by the time we
  // get this far down the tree. We've also already
  // checked and there should only be a single Linode
  // on the user's account.

  const linodeId = Object.keys(linodes.itemsById)[0];
  return <LinodeDetail linodeId={linodeId} isDashboard />;
};

export default React.memo(SingleLinode);
