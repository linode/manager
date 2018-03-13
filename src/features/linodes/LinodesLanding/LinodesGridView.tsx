import * as React from 'react';

import Grid from 'material-ui/Grid';

import  { Action } from 'src/components/ActionMenu';

import LinodeCard from './LinodeCard';

interface Props {
  linodes: Linode.Linode[];
  images: Linode.Image[];
  types: Linode.LinodeType[];
  createActions: (l: Linode.Linode) => Action[];
}

const LinodesGridView: React.StatelessComponent<Props> = (props) => {
  const { linodes, images, types, createActions } = props;

  return (
    <Grid container>
      {linodes.map(linode =>
        <LinodeCard
          key={linode.id}
          linode={linode}
          image={images.find(image => linode.image === image.id)}
          type={types.find(type => linode.type === type.id)}
          actions={createActions(linode)}
        />,
      )}
    </Grid>
  );
};

export default LinodesGridView;
