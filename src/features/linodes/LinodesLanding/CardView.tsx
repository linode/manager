import * as React from 'react';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import withImages from 'src/containers/withImages.container';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';

interface Props {
  data: Linode.Linode[];
  images: Linode.Image[];
  showHead?: boolean;
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
}

type CombinedProps =
  & WithImagesProps
  & PaginationProps
  & Props;

const CardView: React.StatelessComponent<CombinedProps> = (props) => {
  const { data, imagesData, openConfigDrawer, toggleConfirmation } = props;

  return (
    <Grid container>
      {data.map((linode, idx: number) =>
        <LinodeCard
          key={`linode-card-${idx}`}
          linodeId={linode.id}
          linodeStatus={linode.status}
          linodeIpv4={linode.ipv4}
          linodeIpv6={linode.ipv6}
          linodeRegion={linode.region}
          linodeType={linode.type}
          linodeLabel={linode.label}
          linodeBackups={linode.backups}
          linodeTags={linode.tags}
          imageLabel={safeGetImageLabel(imagesData, linode.image)}
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

interface WithImagesProps { imagesData: Linode.Image[] }

export default withImages((ownProps, imagesData) => ({ ...ownProps, imagesData }))(CardView);
