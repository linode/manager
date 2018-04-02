import * as React from 'react';

import Grid from 'src/components/Grid';

import LinodeCard from './LinodeCard';

interface Props {
  linodes: (Linode.Linode & { recentEvent?: Linode.Event })[];
  images: Linode.Image[];
  types: Linode.LinodeType[];
}

const LinodesGridView: React.StatelessComponent<Props> = (props) => {
  const { linodes, images, types } = props;

  return (
    <Grid container>
      {linodes.map(linode =>
        <LinodeCard
          key={linode.id}
          linode={linode}
          image={images.find(image => linode.image === image.id)}
          type={types.find(type => linode.type === type.id)}
        />,
      )}
    </Grid>
  );
};

export default LinodesGridView;
