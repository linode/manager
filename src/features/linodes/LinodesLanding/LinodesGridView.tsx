import * as React from 'react';

import Grid from 'src/components/Grid';

import LinodeCard from './LinodeCard';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

interface Props {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
}

const LinodesGridView: React.StatelessComponent<Props> = (props) => {
  const { linodes, images, openConfigDrawer } = props;

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
          openConfigDrawer={openConfigDrawer}
          linodeSpecDisk={linode.specs.disk}
          linodeSpecMemory={linode.specs.memory}
          linodeSpecVcpus={linode.specs.vcpus}
          linodeSpecTransfer={linode.specs.transfer}
        />,
      )}
    </Grid>
  );
};

export default LinodesGridView;
