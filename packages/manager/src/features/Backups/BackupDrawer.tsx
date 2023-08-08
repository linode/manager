import Stack from '@mui/material/Stack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import {
  useAccountSettings,
  useMutateAccountSettings,
} from 'src/queries/accountSettings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllTypes } from 'src/queries/types';
import { pluralize } from 'src/utilities/pluralize';

import { AutoEnroll } from './AutoEnroll';
import { BackupLinodeRow } from './BackupLinodeRow';
import {
  EnableBackupsRejectedResult,
  getTotalBackupsPrice,
  useEnableBackupsOnLinodesMutation,
} from './utils';

interface FailureNotificationProps {
  failedCount: number;
  successCount: number;
}

const getFailureNotificationText = ({
  failedCount,
  successCount,
}: FailureNotificationProps): string => {
  if (successCount > 0) {
    return `Enabled backups successfully for ${pluralize(
      'Linode',
      'Linodes',
      successCount
    )}
, but ${pluralize('Linode', 'Linodes', failedCount)} failed.`;
  }
  // This function will only be called if at least one backup failed.
  return `There was an error enabling backups for your Linodes.`;
};

interface Props {
  onClose: () => void;
  open: boolean;
}

export const BackupDrawer = (props: Props) => {
  const { onClose, open } = props;

  const {
    data: linodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, open);

  const { data: types, isLoading: typesLoading } = useAllTypes(open);

  const {
    data: accountSettings,
    isLoading: accountSettingsLoading,
  } = useAccountSettings();

  const {
    error: updateAccountSettingsError,
    isLoading: isUpdatingAccountSettings,
    mutateAsync: updateAccountSettings,
  } = useMutateAccountSettings();

  const [shouldEnableAutoEnroll, setShouldEnableAutoEnroll] = React.useState(
    true
  );

  const {
    data: enableBackupsResult,
    isLoading: isEnablingBackups,
    mutateAsync: enableBackups,
  } = useEnableBackupsOnLinodesMutation();

  const failedEnableBackupsCount =
    enableBackupsResult?.filter((result) => result.status === 'rejected')
      .length ?? 0;

  const successfulEnableBackupsCount =
    enableBackupsResult?.filter((result) => result.status === 'fulfilled')
      .length ?? 0;

  const linodesWithoutBackups =
    linodes?.filter((linode) => !linode.backups.enabled) ?? [];

  const linodeCount = linodesWithoutBackups.length;

  const renderBackupsTable = () => {
    if (linodesLoading || typesLoading || accountSettingsLoading) {
      return <TableRowLoading columns={3} />;
    }
    if (linodesError) {
      return <TableRowError colSpan={4} message={linodesError?.[0]?.reason} />;
    }
    return linodesWithoutBackups.map((linode) => (
      <BackupLinodeRow
        error={
          (enableBackupsResult?.find(
            (result) =>
              result.linode.id === linode.id && result.status === 'rejected'
          ) as EnableBackupsRejectedResult | undefined)?.reason?.[0]?.reason
        }
        key={linode.id}
        linode={linode}
      />
    ));
  };

  const handleSubmit = () => {
    if (shouldEnableAutoEnroll) {
      updateAccountSettings({ backups_enabled: true });
    }

    enableBackups(linodesWithoutBackups);
  };

  return (
    <Drawer onClose={onClose} open={open} title="Enable All Backups">
      <Stack spacing={2}>
        <Typography variant="body1">
          Three backup slots are executed and rotated automatically: a daily
          backup, a 2-7 day old backup, and an 8-14 day old backup. See our
          {` `}
          <Link to="https://www.linode.com/docs/platform/disk-images/linode-backup-service/">
            guide on Backups
          </Link>{' '}
          for more information on features and limitations. Confirm to add
          backups to{' '}
          <strong>{pluralize('Linode', 'Linodes', linodeCount)}</strong>.
        </Typography>
        {failedEnableBackupsCount > 0 && (
          <Box>
            <Notice error spacingBottom={0}>
              {getFailureNotificationText({
                failedCount: failedEnableBackupsCount,
                successCount: successfulEnableBackupsCount,
              })}
            </Notice>
          </Box>
        )}
        {/* Don't show this if the setting is already active. */}
        {!accountSettings?.backups_enabled && (
          <AutoEnroll
            enabled={shouldEnableAutoEnroll}
            error={updateAccountSettingsError?.[0].reason}
            toggle={() => setShouldEnableAutoEnroll((prev) => !prev)}
          />
        )}
        <Box>
          <DisplayPrice
            interval="mo"
            price={getTotalBackupsPrice(linodesWithoutBackups, types ?? [])}
          />
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            label: 'Confirm',
            loading: isUpdatingAccountSettings || isEnablingBackups,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
          style={{ margin: 0, padding: 0 }}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderBackupsTable()}</TableBody>
        </Table>
      </Stack>
    </Drawer>
  );
};
