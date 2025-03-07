import { Box, Notice, Stack, Typography } from '@linode/ui';
import { isNumber, pluralize } from '@linode/utilities';
import { styled } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import {
  useAccountSettings,
  useMutateAccountSettings,
} from 'src/queries/account/settings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllTypes } from 'src/queries/types';
import { getTotalBackupsPrice } from 'src/utilities/pricing/backups';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';

import { AutoEnroll } from './AutoEnroll';
import { BackupLinodeRow } from './BackupLinodeRow';
import {
  getFailureNotificationText,
  useEnableBackupsOnLinodesMutation,
} from './utils';

import type { EnableBackupsRejectedResult } from './utils';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const BackupDrawer = (props: Props) => {
  const { onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

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
    isPending: isUpdatingAccountSettings,
    mutateAsync: updateAccountSettings,
  } = useMutateAccountSettings();

  const [shouldEnableAutoEnroll, setShouldEnableAutoEnroll] = React.useState(
    true
  );

  const {
    data: enableBackupsResult,
    isPending: isEnablingBackups,
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
      return <TableRowLoading columns={4} />;
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

  const handleSubmit = async () => {
    if (shouldEnableAutoEnroll) {
      updateAccountSettings({ backups_enabled: true });
    }

    const result = await enableBackups(linodesWithoutBackups);

    const hasFailures = result.some((r) => r.status === 'rejected');
    const successfulEnables = result.filter((r) => r.status === 'fulfilled')
      .length;

    if (hasFailures) {
      // Just stop because the React Query error state will update and
      // display errors in the table.
      return;
    }

    const pluralizedLinodes =
      successfulEnables > 1 ? 'Linodes have' : 'Linode has';

    const text = shouldEnableAutoEnroll
      ? `${successfulEnables} ${pluralizedLinodes} been enrolled in automatic backups, and
all new Linodes will automatically be backed up.`
      : `${successfulEnables} ${pluralizedLinodes} been enrolled in automatic backups.`;

    enqueueSnackbar(text, {
      variant: 'success',
    });
    onClose();
  };

  const totalBackupsPrice = getTotalBackupsPrice({
    linodes: linodesWithoutBackups,
    types: types ?? [],
  });

  return (
    <Drawer onClose={onClose} open={open} title="Enable All Backups" wide>
      <Stack spacing={2}>
        <Typography variant="body1">
          Three backup slots are executed and rotated automatically: a daily
          backup, a 2-7 day old backup, and an 8-14 day old backup. See our
          {` `}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/backup-service">
            guide on Backups
          </Link>{' '}
          for more information on features and limitations.{' '}
        </Typography>
        {failedEnableBackupsCount > 0 && (
          <Box>
            <Notice spacingBottom={0} variant="error">
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
        <StyledPricingBox>
          <StyledTypography variant="h2">
            Total for {pluralize('Linode', 'Linodes', linodeCount)}:
          </StyledTypography>
          &nbsp;
          <DisplayPrice
            price={
              isNumber(totalBackupsPrice) ? totalBackupsPrice : UNKNOWN_PRICE
            }
            interval="mo"
          />
        </StyledPricingBox>
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
        <Table aria-label="List of Linodes without backups">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderBackupsTable()}</TableBody>
        </Table>
      </Stack>
    </Drawer>
  );
};

const StyledPricingBox = styled(Box, { label: 'StyledPricingBox' })(({}) => ({
  alignItems: 'center',
  display: 'flex',
}));

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    color: theme.palette.text.primary,
  })
);
