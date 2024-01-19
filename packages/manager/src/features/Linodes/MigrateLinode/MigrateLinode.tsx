import { Event } from '@linode/api-v4/lib/account';
import { styled, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { MBpsInterDC } from 'src/constants';
import { EUAgreementCheckbox } from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { regionSupportsMetadata } from 'src/features/Linodes/LinodesCreate/utilities';
import { useFlags } from 'src/hooks/useFlags';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { isEventRelevantToLinode } from 'src/queries/events/event.helpers';
import {
  useEventsPollingActions,
  useInProgressEvents,
} from 'src/queries/events/events';
import { useImageQuery } from 'src/queries/images';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useLinodeMigrateMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { sendMigrationInitiatedEvent } from 'src/utilities/analytics';
import { formatDate } from 'src/utilities/formatDate';
import { getGDPRDetails } from 'src/utilities/formatRegion';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { getLinodeDescription } from 'src/utilities/getLinodeDescription';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { addUsedDiskSpace } from '../LinodesDetail/LinodeStorage/LinodeDisks';
import { CautionNotice } from './CautionNotice';
import { ConfigureForm } from './ConfigureForm';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  open: boolean;
}

export const MigrateLinode = React.memo((props: Props) => {
  const { linodeId, onClose, open } = props;
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const { resetEventsPolling } = useEventsPollingActions();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: type } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const { data: image } = useImageQuery(
    linode?.image ?? '',
    linode !== undefined && open
  );

  const { data: disks } = useAllLinodeDisksQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );

  const { data: events } = useInProgressEvents();

  const eventsForLinode = linodeId
    ? events?.filter((event) => isEventRelevantToLinode(event, linodeId)) ?? []
    : [];

  const {
    error,
    isLoading,
    mutateAsync: migrateLinode,
    reset,
  } = useLinodeMigrateMutation(linodeId ?? -1);

  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements(open);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: regionsData } = useRegionsQuery();
  const flags = useFlags();

  const [selectedRegion, handleSelectRegion] = React.useState<null | string>(
    null
  );

  const [hasConfirmed, setConfirmed] = React.useState<boolean>(false);
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const { showGDPRCheckbox } = getGDPRDetails({
    agreements,
    profile,
    regions: regionsData,
    selectedRegionId: selectedRegion ?? '',
  });

  React.useEffect(() => {
    if (error) {
      scrollErrorIntoView();
    }
  }, [error]);

  React.useEffect(() => {
    if (open) {
      reset();
      setConfirmed(false);
      handleSelectRegion(null);
    }
  }, [open]);

  const metadataMigrateWarning = React.useMemo(() => {
    if (!flags.metadata || !selectedRegion || !linode) {
      return;
    }

    const currentRegionSupportsMetadata = regionSupportsMetadata(
      regionsData ?? [],
      linode.region
    );
    const selectedRegionSupportsMetadata = regionSupportsMetadata(
      regionsData ?? [],
      selectedRegion
    );

    return currentRegionSupportsMetadata && !selectedRegionSupportsMetadata
      ? 'The selected Data Center does not support Metadata. If your Linode is rebuilt, it will boot without using any associated User Data.'
      : undefined;
  }, [flags.metadata, linode, regionsData, selectedRegion]);

  if (!linode) {
    return null;
  }

  const region = linode.region;

  const handleMigrate = () => {
    reset();

    if (!selectedRegion || !hasConfirmed) {
      return;
    }

    return migrateLinode({
      region: selectedRegion,
    }).then(() => {
      resetEventsPolling();
      sendMigrationInitiatedEvent(
        region,
        selectedRegion,
        +formatDate(new Date().toISOString(), {
          format: 'H',
          timezone: profile?.timezone,
        })
      );
      enqueueSnackbar(
        'Your Linode has entered the migration queue and will begin migration shortly.',
        { variant: 'success' }
      );
      if (hasSignedAgreement) {
        updateAccountAgreements({
          eu_model: true,
          privacy_policy: true,
        }).catch(reportAgreementSigningError);
      }
      onClose();
    });
  };

  const newLabel = getLinodeDescription(
    type ? formatStorageUnits(type.label) : linode.type ?? 'Unknown Type',
    linode.specs.memory,
    linode.specs.disk,
    linode.specs.vcpus,
    image?.label ?? linode.image ?? 'Unknown Image'
  );

  const disabledText = getDisabledReason(
    eventsForLinode,
    linode.status,
    linodeId ?? -1
  );

  /** how long will this take to migrate when the migration starts */
  const migrationTimeInMinutes = Math.ceil(
    addUsedDiskSpace(disks ?? []) / MBpsInterDC / 60
  );

  return (
    <Dialog
      fullHeight
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={`Migrate Linode ${linode.label ?? ''} to another region`}
    >
      {error && <Notice text={error?.[0].reason} variant="error" />}
      <Typography sx={{ marginTop: theme.spacing(2) }} variant="h2">
        {newLabel}
      </Typography>
      {/*
         commenting out for now because we need further clarification from
         stakeholders about whether or not we want to prevent multiple cross-data-center migrations.
         */}
      {/* <MigrationImminentNotice
        linodeID={props.linodeID}
        notifications={notifications}
      /> */}
      <CautionNotice
        hasConfirmed={hasConfirmed}
        linodeId={linodeId}
        metadataWarning={metadataMigrateWarning}
        migrationTimeInMins={migrationTimeInMinutes}
        setConfirmed={setConfirmed}
      />
      <ConfigureForm
        backupEnabled={linode.backups.enabled}
        currentRegion={region}
        handleSelectRegion={handleSelectRegion}
        linodeType={linode.type}
        selectedRegion={selectedRegion}
      />
      <Box
        sx={{
          marginTop: theme.spacing(3),
          [theme.breakpoints.down('md')]: {
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          },
        }}
        alignItems="center"
        display="flex"
        justifyContent={showGDPRCheckbox ? 'space-between' : 'flex-end'}
      >
        {showGDPRCheckbox ? (
          <StyledAgreementCheckbox
            centerCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
          />
        ) : null}
        <Button
          disabled={
            !!disabledText ||
            !hasConfirmed ||
            !selectedRegion ||
            (showGDPRCheckbox && !hasSignedAgreement)
          }
          sx={{
            [theme.breakpoints.down('md')]: {
              marginTop: theme.spacing(2),
            },
          }}
          buttonType="primary"
          loading={isLoading}
          onClick={handleMigrate}
        >
          Enter Migration Queue
        </Button>
        {!!disabledText && <TooltipIcon status="help" text={disabledText} />}
      </Box>
    </Dialog>
  );
});

const StyledAgreementCheckbox = styled(EUAgreementCheckbox, {
  label: 'StyledAgreementCheckbox',
})(({ theme }) => ({
  maxWidth: '70%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 'unset',
  },
}));

const getDisabledReason = (
  events: Event[],
  linodeStatus: string,
  linodeID: number
) => {
  if (
    events[0]?.action === 'linode_migrate_datacenter' &&
    events[0]?.percent_complete !== 100
  ) {
    return `Your Linode is currently being migrated.`;
  }

  /**
   * commenting this out for now because we need further clarification
   * from stakeholders about if we want people to overwrite existing migrations.
   */

  // if (
  //   !!notifications.find(eachNotification => {
  //     return (
  //       eachNotification.label.match(/migrat/i) &&
  //       eachNotification.entity &&
  //       eachNotification.entity.id === linodeID
  //     );
  //   })
  // ) {
  //   return 'Your Linode is already scheduled for a migration';
  // }

  return '';
};
