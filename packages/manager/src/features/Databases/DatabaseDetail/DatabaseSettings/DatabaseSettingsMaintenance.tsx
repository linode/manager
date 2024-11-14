import { Grid, styled } from '@mui/material';
import * as React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Typography } from 'src/components/Typography';
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
    <Grid container data-qa-settings-section="Maintenance">
      <Grid item xs={4}>
        <StyledTypography variant="h3">Maintenance</StyledTypography>
        <BoldTypography>Version</BoldTypography>
        <StyledTypography>{engineVersion}</StyledTypography>
        <StyledLinkButton
          data-testid="upgrade"
          disabled={!versions?.length}
          onClick={onUpgradeVersion}
        >
          Upgrade Version
        </StyledLinkButton>
      </Grid>
      <Grid item xs={4}>
        {/*
        TODO Uncomment and provide value when the EOL is returned by the API.
        Currently, it is not supported, however they are working on returning it since it has value to the end user
        <StyledTypography variant="h3">End of life</StyledTypography>
        */}
      </Grid>
      <Grid item xs={4}>
        <StyledTypography variant="h3">Maintenance updates</StyledTypography>
        {hasUpdates ? (
          <BoldTypography>
            One or more minor version upgrades or patches will be applied during
            the next maintenance window.{' '}
            <StyledLinkButton data-testid="review" onClick={onReviewUpdates}>
              Click to review
            </StyledLinkButton>
          </BoldTypography>
        ) : (
          <BoldTypography>
            There are no minor version upgrades or patches planned for the next
            maintenance window.{' '}
          </BoldTypography>
        )}
      </Grid>
    </Grid>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.25),
}));

const BoldTypography = styled(StyledTypography)(({ theme }) => ({
  fontFamily: theme.font.bold,
}));
