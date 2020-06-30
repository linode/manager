import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import Grid from 'src/components/Grid';
import { PaginationProps } from 'src/components/Paginate';
import withImages from 'src/containers/withImages.container';
import { safeGetImageLabel } from 'src/utilities/safeGetImageLabel';
import LinodeCard from './LinodeCard';

import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import LinodeEntityDetail from 'src/features/linodes/LinodeEntityDetail';
import useFlags from 'src/hooks/useFlags';

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

const CardView: React.FC<CombinedProps> = props => {
  const { data, imagesData, openDeleteDialog, openPowerActionDialog } = props;

  const flags = useFlags();

  return (
    <Grid container>
      {flags.cmr
        ? data.map((linode, idx: number) => (
            <Grid item xs={12} style={{ marginBottom: 20 }}>
              <LinodeEntityDetail
                key={`linode-card-${idx}`}
                variant="landing"
                linode={linode}
                numVolumes={2}
                username="linode-user"
                openLishConsole={() => null}
                backups={linode.backups}
                openDeleteDialog={openDeleteDialog}
                openPowerActionDialog={openPowerActionDialog}
              />
            </Grid>
          ))
        : data.map((linode, idx: number) => (
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
  imagesData: Record<string, Image>;
}

const enhanced = compose<CombinedProps, Props>(
  withImages((ownProps, imagesData) => ({
    ...ownProps,
    imagesData
  }))
);

export default enhanced(CardView);
