import * as React from 'react';

import Grid from 'src/components/Grid';

import LinodeCard from './LinodeCard';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

interface Props {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  types: Linode.LinodeType[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
     linodeId: number, linodeLabel: string) => void;
}

const LinodesGridView: React.StatelessComponent<Props> = (props) => {
  const { linodes, types, images, openConfigDrawer, toggleConfirmation } = props;

  return (
    <Grid container>
      {linodes.map(linode =>
        <LinodeCard
          key={linode.id}
          linodeId={linode.id}
          linodeStatus={linode.status}
          linodeIpv4={linode.ipv4}
          linodeIpv6={linode.ipv6}
          linodeRegion={linode.region}
          linodeNotification={linode.notification}
          linodeLabel={linode.label}
          linodeRecentEvent={linode.recentEvent}
          image={images.find(image => linode.image === image.id)}
          type={types.find(type => linode.type === type.id)}
          openConfigDrawer={openConfigDrawer}
          toggleConfirmation={toggleConfirmation}
        />,
      )}
    </Grid>
  );
};

export default LinodesGridView;
