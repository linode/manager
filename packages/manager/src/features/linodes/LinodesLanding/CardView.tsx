import { Image } from 'linode-js-sdk/lib/images';
import { Config } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import withImages from 'src/containers/withImages.container';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';

import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

interface Props {
  data: LinodeWithMaintenance[];
  images: Image[];
  showHead?: boolean;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
}

type CombinedProps = WithImagesProps & PaginationProps & Props;

const CardView: React.StatelessComponent<CombinedProps> = props => {
  const { data, imagesData, openDeleteDialog, openPowerActionDialog } = props;

  return (
    <Grid container>
      {data.map((linode, idx: number) => (
        <LinodeCard
          key={`linode-card-${idx}`}
          backups={linode.backups}
          id={linode.id}
          ipv4={linode.ipv4}
          ipv6={linode.ipv6}
          maintenanceStartTime={
            linode.maintenance ? linode.maintenance.when : ''
          }
          label={linode.label}
          region={linode.region}
          status={linode.status}
          tags={linode.tags}
          mostRecentBackup={linode.mostRecentBackup}
          disk={linode.specs.disk}
          vcpus={linode.specs.vcpus}
          memory={linode.specs.memory}
          type={linode.type}
          image={linode.image}
          imageLabel={safeGetImageLabel(imagesData, linode.image)}
          openDeleteDialog={openDeleteDialog}
          openPowerActionDialog={openPowerActionDialog}
        />
      ))}
    </Grid>
  );
};

interface WithImagesProps {
  imagesData: Image[];
}

export default withImages((ownProps, imagesData) => ({
  ...ownProps,
  imagesData
}))(CardView);
