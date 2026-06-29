import { Button, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useDatabaseEnginesQuery } from '@linode/queries';
import * as React from 'react';

import {
  getDatabasesDescription,
  hasPendingUpdates,
  upgradableVersions,
} from 'src/features/Databases/utilities';

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
    <div data-qa-settings-section="Maintenance" style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <h3 style={{ margin: 0, marginBottom: Spacing.S4 }}>Maintenance</h3>
        <p style={{ margin: 0 }}>
          <strong>Version</strong>
        </p>
        <p style={{ margin: 0 }}>{engineVersion}</p>
        <Button
          data-testid="upgrade"
          disabled={!versions?.length || hasUpdates}
          onClick={onUpgradeVersion}
          variant="link"
        >
          Upgrade Version
        </Button>
        {hasUpdates && (
          <Tooltip
            style={{ marginLeft: Spacing.S4 }}
            tooltipPlacement="bottom"
            tooltipText="Upgrades are disabled due to pending maintenance updates. To enable the upgrade, apply available updates now or wait until the next maintenance window."
          >
            <Icon
              icon="info-outline"
              size="m"
              style={{ position: 'relative', top: -1 }}
            />
          </Tooltip>
        )}
      </div>
      {/*
        TODO Uncomment and provide value when the EOL is returned by the API.
        Currently, it is not supported, however they are working on returning it since it has value to the end user
        <div>
          <StyledTypography variant="h3">End of life</StyledTypography>
        </div>
      */}
      <div style={{ width: '50%' }}>
        <h3 style={{ margin: 0, marginBottom: Spacing.S4 }}>
          Maintenance Updates
        </h3>
        {hasUpdates ? (
          <p style={{ margin: 0 }}>
            One or more minor version upgrades or patches will be applied during
            the next maintenance window.{' '}
            <Button
              data-testid="review"
              onClick={onReviewUpdates}
              variant="link"
            >
              Click to review
            </Button>
          </p>
        ) : (
          <p style={{ margin: 0 }}>
            There are no minor version upgrades or patches planned for the next
            maintenance window.{' '}
          </p>
        )}
      </div>
    </div>
  );
};
