import * as React from 'react';

import Grid from 'src/components/Grid';

import LinodeCard from './LinodeCard';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

interface Props {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  types: Linode.LinodeType[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
}

const LinodesGridView: React.StatelessComponent<Props> = (props) => {
  const { linodes, types, images, openConfigDrawer } = props;

  return (
    <Grid container>
      {linodes.map(linode =>
        <LinodeCard
          key={linode.id}
          linode={linode}
          image={images.find(image => linode.image === image.id)}
          type={types.find(type => linode.type === type.id)}
          openConfigDrawer={openConfigDrawer}
        />,
      )}
    </Grid>
  );
};

export default LinodesGridView;
