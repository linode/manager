import { Button, Typography } from '@linode/ui';
import * as React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';

import {
  getNextVersion,
  useLkeStandardOrEnterpriseVersions,
} from '../kubeUtils';
import UpgradeVersionModal from '../UpgradeVersionModal';

import type { KubernetesTier } from '@linode/api-v4';

interface Props {
  clusterID: number;
  clusterLabel: string;
  clusterTier: KubernetesTier;
  currentVersion: string;
}

export const UpgradeKubernetesVersionBanner = (props: Props) => {
  const { clusterID, clusterLabel, clusterTier, currentVersion } = props;

  const { versions } = useLkeStandardOrEnterpriseVersions(clusterTier);
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
          forceImportantIconVerticalCenter
          preferenceKey={`${clusterID}-${currentVersion}`}
          variant="info"
        >
          <Typography>
            A new version of Kubernetes is available ({nextVersion}).
          </Typography>
        </DismissibleBanner>
      ) : null}
      <UpgradeVersionModal
        clusterID={clusterID}
        clusterLabel={clusterLabel}
        clusterTier={clusterTier}
        currentVersion={currentVersion}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default React.memo(UpgradeKubernetesVersionBanner);
