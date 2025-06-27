import { TooltipIcon, Typography } from '@linode/ui';
import { GridLegacy, styled } from '@mui/material';
import { Button } from 'akamai-cds-react-components';
import * as React from 'react';

import {
  getDatabasesDescription,
  hasPendingUpdates,
  upgradableVersions,
} from 'src/features/Databases/utilities';
import { useDatabaseEnginesQuery } from 'src/queries/databases/databases';

import type { Engine, PendingUpdates } from '@linode/api-v4';

interface Props {
  databaseEngine: Engine;
  databasePendingUpdates?: PendingUpdates[];
  databaseVersion: string;
  onReviewUpdates: () => void;
  onUpgradeVersion: () => void;
}

export const DatabaseSettingsMaintenance = (props: Props) => {
  const {
    databaseEngine: engine,
    databasePendingUpdates,
    databaseVersion: version,
    onReviewUpdates,
    onUpgradeVersion,
  } = props;
  const engineVersion = getDatabasesDescription({ engine, version });
  const { data: engines } = useDatabaseEnginesQuery(true);
  const versions = upgradableVersions(engine, version, engines);
  const hasUpdates = hasPendingUpdates(databasePendingUpdates);

  return (
    <GridLegacy container data-qa-settings-section="Maintenance">
      <GridLegacy item xs={6}>
        <StyledTypography variant="h3">Maintenance</StyledTypography>
        <BoldTypography>Version</BoldTypography>
        <StyledTypography>{engineVersion}</StyledTypography>
        <Button
          data-testid="upgrade"
          disabled={!versions?.length || hasUpdates}
          onClick={onUpgradeVersion}
          variant="link"
        >
          Upgrade Version
        </Button>
        {hasUpdates && (
          <TooltipIcon
            status="help"
            sxTooltipIcon={{
              padding: '0px 8px',
            }}
            text={
              <Typography>
                Upgrades are disabled due to pending maintenance updates. To
                enable the upgrade, apply available updates now or wait until
                the next maintenance window.
              </Typography>
            }
          />
        )}
      </GridLegacy>
      {/*
        TODO Uncomment and provide value when the EOL is returned by the API.
        Currently, it is not supported, however they are working on returning it since it has value to the end user
        <Grid item xs={4}>
          <StyledTypography variant="h3">End of life</StyledTypography>
        </Grid>
      */}
      <GridLegacy item xs={6}>
        <StyledTypography variant="h3">Maintenance updates</StyledTypography>
        {hasUpdates ? (
          <BoldTypography>
            One or more minor version upgrades or patches will be applied during
            the next maintenance window.{' '}
            <Button
              data-testid="review"
              onClick={onReviewUpdates}
              variant="link"
            >
              Click to review
            </Button>
          </BoldTypography>
        ) : (
          <BoldTypography>
            There are no minor version upgrades or patches planned for the next
            maintenance window.{' '}
          </BoldTypography>
        )}
      </GridLegacy>
    </GridLegacy>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.25),
}));

const BoldTypography = styled(StyledTypography)(({ theme }) => ({
  font: theme.font.bold,
}));
