import * as React from 'react';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Grid from 'src/components/Grid';
import { useKubernetesVersionQuery } from 'src/queries/kubernetesVersion';
import { getNextVersion } from '../kubeUtils';
import UpgradeVersionModal from '../UpgradeVersionModal';

interface Props {
  clusterID: number;
  clusterLabel: string;
  currentVersion: string;
}

export type CombinedProps = Props;

export const UpgradeKubernetesVersionBanner: React.FC<Props> = (props) => {
  const { clusterID, clusterLabel, currentVersion } = props;
  const { data: versions } = useKubernetesVersionQuery();
  const nextVersion = getNextVersion(currentVersion, versions ?? []);

  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <>
      {nextVersion ? (
        <DismissibleBanner
          preferenceKey={`${clusterID}-${currentVersion}`}
          productInformationIndicator
        >
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography>
                A new version of Kubernetes is available ({nextVersion}).
              </Typography>
            </Grid>
            <Grid item>
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
        nextVersion={nextVersion ?? ''}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default React.memo(UpgradeKubernetesVersionBanner);
