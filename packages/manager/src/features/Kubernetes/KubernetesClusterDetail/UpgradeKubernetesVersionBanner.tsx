import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Typography } from 'src/components/Typography';
import { useKubernetesVersionQuery } from 'src/queries/kubernetes';

import UpgradeVersionModal from '../UpgradeVersionModal';
import { getNextVersion } from '../kubeUtils';

interface Props {
  clusterID: number;
  clusterLabel: string;
  currentVersion: string;
}

export const UpgradeKubernetesVersionBanner = (props: Props) => {
  const { clusterID, clusterLabel, currentVersion } = props;
  const { data: versions } = useKubernetesVersionQuery();
  const nextVersion = getNextVersion(currentVersion, versions ?? []);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const actionButton = (
    <Button buttonType="primary" onClick={() => setDialogOpen(true)}>
      Upgrade Version
    </Button>
  );

  return (
    <>
      {nextVersion ? (
        <DismissibleBanner
          actionButton={actionButton}
          variant="info"
          preferenceKey={`${clusterID}-${currentVersion}`}
        >
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="space-between"
          >
            <Grid>
              <Typography>
                A new version of Kubernetes is available ({nextVersion}).
              </Typography>
            </Grid>
          </Grid>
        </DismissibleBanner>
      ) : null}
      <UpgradeVersionModal
        clusterID={clusterID}
        clusterLabel={clusterLabel}
        currentVersion={currentVersion}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default React.memo(UpgradeKubernetesVersionBanner);
