import * as React from 'react';

import Grid from 'src/components/Grid';

import LinodeCard from './LinodeCard';

import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';

interface Props {
  linodes: Linode.EnhancedLinode[];
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
     linodeId: number, linodeLabel: string) => void;
}

const safeGetImageLabel = (images: Linode.Image[], slug: string | null): string => {
  if (!slug) {
    return 'No Image'
  }
  const iv = images.find((i) => i.id === slug);
  return iv ? iv.label : 'Unknown Image';
};

const LinodesGridView: React.StatelessComponent<Props> = (props) => {
  const { linodes, images, openConfigDrawer, toggleConfirmation } = props;

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
          linodeType={linode.type}
          linodeNotification={linode.notification}
          linodeLabel={linode.label}
          linodeRecentEvent={linode.recentEvent}
          imageLabel={safeGetImageLabel(images, linode.image)}
          openConfigDrawer={openConfigDrawer}
          linodeSpecDisk={linode.specs.disk}
          linodeSpecMemory={linode.specs.memory}
          linodeSpecVcpus={linode.specs.vcpus}
          linodeSpecTransfer={linode.specs.transfer}
          toggleConfirmation={toggleConfirmation}
        />,
      )}
    </Grid>
  );
};

export default LinodesGridView;
