import {
  ActionsPanel,
  Autocomplete,
  FormControl,
  Notice,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  DATABASE_ENGINE_MAP,
  upgradableVersions,
} from 'src/features/Databases/utilities';
import {
  useDatabaseEnginesQuery,
  useDatabaseMutation,
} from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
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

  const [
    selectedVersion,
    setSelectedVersion,
  ] = React.useState<VersionOption | null>(null);
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
        enqueueSnackbar('Database version upgraded successfully.', {
          variant: 'success',
        });
        onClose();
      })
      .catch((e) => {
        setIsLoading(false);
        setError(getAPIErrorOrDefault(e, defaultError)[0].reason);
      });
  };

  const renderActions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'upgrade',
        disabled: !selectedVersion,
        label: 'Upgrade',
        loading,
        onClick: onUpgradeVersion,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      actions={renderActions}
      error={error}
      onClose={onClose}
      open={open}
      title={`Upgrade ${dialogTitle}`}
    >
      <Typography sx={{ mb: theme.spacing(1.5) }}>
        Current Version: v{databaseVersion}
      </Typography>
      <Typography>
        {`Please select the new ${DATABASE_ENGINE_MAP[databaseEngine]} version. Once you select the new version we
        will check it for compatibility with your current version. If it is
        compatible you can proceed with the upgrade.`}
      </Typography>

      <FormControl sx={{ mb: theme.spacing(2) }}>
        <Autocomplete
          autoComplete={false}
          label="New Version"
          onChange={(_, v) => setSelectedVersion(v)}
          options={versions ?? []}
          placeholder="Select a version"
          value={selectedVersion}
        />
      </FormControl>

      {loading && (
        <Notice variant="info">
          <Typography style={{ fontSize: '0.875rem' }}>
            Checking version upgrade compatibility, then will start upgrade
          </Typography>
          {/* Then the text changes to "Starting to upgrade." then closes after 1 second */}
        </Notice>
      )}
      <Notice variant="warning">
        <Typography style={{ fontSize: '0.875rem' }}>
          Reverting back to the prior version is not possible once the upgrade
          has been started
        </Typography>
      </Notice>
    </ConfirmationDialog>
  );
};
