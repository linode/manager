import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from '@mui/material/Unstable_Grid2';
import { useKubernetesVersionQuery } from 'src/queries/kubernetes';
import { getNextVersion } from '../kubeUtils';
import UpgradeVersionModal from '../UpgradeVersionModal';

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

  return (
    <>
      {nextVersion ? (
        <DismissibleBanner
          preferenceKey={`${clusterID}-${currentVersion}`}
          success
        >
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid>
              <Typography>
                A new version of Kubernetes is available ({nextVersion}).
              </Typography>
            </Grid>
            <Grid>
              <Button onClick={() => setDialogOpen(true)} buttonType="primary">
                Upgrade Version
              </Button>
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
