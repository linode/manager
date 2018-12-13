import * as React from 'react';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';

interface WithLinodes {
  data: Linode.Linode[];
}

interface ViewProps {
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
}

type CombinedProps =
  & PaginationProps
  & ViewProps
  & WithLinodes;

const CardView: React.StatelessComponent<CombinedProps> = (props) => {
  const { data, images, openConfigDrawer, toggleConfirmation } = props;

  return (
    <Grid container>
      {data.map(linode =>
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
          linodeBackups={linode.backups}
          linodeTags={linode.tags}
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
  )
};

export default CardView;
