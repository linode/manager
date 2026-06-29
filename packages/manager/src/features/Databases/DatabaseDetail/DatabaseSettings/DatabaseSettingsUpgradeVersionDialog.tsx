import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  FormField,
  Modal,
  NotificationBanner,
  Select,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useDatabaseEnginesQuery, useDatabaseMutation } from '@linode/queries';
import * as React from 'react';

import {
  DATABASE_ENGINE_MAP,
  upgradableVersions,
} from 'src/features/Databases/utilities';

import type { Engine } from '@linode/api-v4/lib/databases';

interface Props {
  databaseEngine: Engine;
  databaseID: number;
  databaseLabel: string;
  databaseVersion: string;
  onClose: () => void;
  open: boolean;
}

interface VersionOption {
  label: string;
  value: string;
}

export const DatabaseSettingsUpgradeVersionDialog = (props: Props) => {
  const {
    databaseEngine,
    databaseID,
    databaseLabel,
    databaseVersion,
    onClose,
    open,
  } = props;

  const { mutateAsync: updateDatabase } = useDatabaseMutation(
    databaseEngine,
    databaseID
  );
  const { data: engines } = useDatabaseEnginesQuery(true);

  const versions = upgradableVersions(
    databaseEngine,
    databaseVersion,
    engines
  )?.map((engine) => {
    return {
      label: `v${engine.version}`,
      value: engine.version,
    };
  });

  const [selectedVersion, setSelectedVersion] =
    React.useState<null | VersionOption>(null);
  const [error, setError] = React.useState('');
  const [loading, setIsLoading] = React.useState(false);

  const dialogTitle = `${DATABASE_ENGINE_MAP[databaseEngine]} on ${databaseLabel}`;
  const defaultError = 'There was an error upgrading this version.';

  const onUpgradeVersion = () => {
    if (!selectedVersion) {
      return;
    }
    setIsLoading(true);
    updateDatabase({ version: selectedVersion.value })
      .then(() => {
        setIsLoading(false);
        toast.open({
          text: 'Database version upgraded successfully.',
          type: 'success',
        });
        handleClose();
      })
      .catch((e) => {
        setIsLoading(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  const handleClose = () => {
    setSelectedVersion(null);
    setError('');
    onClose();
  };

  return (
    <Modal closeModal={handleClose} open={open} size="medium">
      <span slot="title">Upgrade {dialogTitle}</span>
      <div slot="body">
        {error ? (
          <NotificationBanner type="error">{error}</NotificationBanner>
        ) : undefined}
        <p style={{ marginBottom: Spacing.S6 }}>
          Current Version: v{databaseVersion}
        </p>
        <p>
          {`Please select the new ${DATABASE_ENGINE_MAP[databaseEngine]} version. Once you select the new version we
        will check it for compatibility with your current version. If it is
        compatible you can proceed with the upgrade.`}
        </p>

        <FormField style={{ marginBottom: Spacing.S16 }}>
          <label
            htmlFor="new-version"
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            style={{ fontWeight: 700, marginBottom: Spacing.S8 }}
          >
            New Version
          </label>
          <Select
            clearable
            id="new-version"
            items={versions ?? []}
            onChange={(e) =>
              setSelectedVersion(e.detail as unknown as VersionOption)
            }
            placeholder="Select a version"
            selected={selectedVersion}
            style={{ width: 416 }}
            valueFn={(option) => (option as VersionOption).label}
          />
        </FormField>

        {loading && (
          <NotificationBanner style={{ marginBottom: Spacing.S16 }} type="info">
            <p style={{ fontSize: '0.875rem' }}>
              Checking version upgrade compatibility, then will start upgrade
            </p>
            {/* Then the text changes to "Starting to upgrade." then closes after 1 second */}
          </NotificationBanner>
        )}
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          type="warning"
        >
          <p style={{ fontSize: '0.875rem' }}>
            Reverting back to the prior version is not possible once the upgrade
            has been started
          </p>
        </NotificationBanner>
      </div>
      <div slot="actions" style={{ display: 'flex', alignItems: 'center' }}>
        <Button data-testid="cancel" onClick={handleClose} variant="link">
          Cancel
        </Button>
        <Button
          data-testid="upgrade"
          disabled={!selectedVersion}
          onClick={onUpgradeVersion}
          processing={loading}
          variant="primary"
        >
          Upgrade
        </Button>
      </div>
    </Modal>
  );
};
