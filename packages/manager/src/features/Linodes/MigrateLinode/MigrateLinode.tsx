import { Event } from '@linode/api-v4/lib/account';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import Button from 'src/components/Button';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Notice } from 'src/components/Notice/Notice';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { MBpsInterDC } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import EUAgreementCheckbox from 'src/features/Account/Agreements/EUAgreementCheckbox';
import { addUsedDiskSpace } from 'src/features/Linodes/LinodesDetail/LinodeAdvanced/LinodeDiskSpace';
import useFlags from 'src/hooks/useFlags';
import {
  reportAgreementSigningError,
  useAccountAgreements,
  useMutateAccountAgreements,
} from 'src/queries/accountAgreements';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { formatDate } from 'src/utilities/formatDate';
import { isEURegion } from 'src/utilities/formatRegion';
import { sendMigrationInitiatedEvent } from 'src/utilities/analytics';
import { getLinodeDescription } from 'src/utilities/getLinodeDescription';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import CautionNotice from './CautionNotice';
import ConfigureForm from './ConfigureForm';
import {
  useLinodeMigrateMutation,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import useEvents from 'src/hooks/useEvents';
import { isEventRelevantToLinode } from 'src/store/events/event.selectors';
import { useImageQuery } from 'src/queries/images';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

const useStyles = makeStyles((theme: Theme) => ({
  details: {
    marginTop: theme.spacing(2),
  },
  actionWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  vlanHelperText: {
    marginTop: theme.spacing(0.5),
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
  },
  agreement: {
    maxWidth: '70%',
    [theme.breakpoints.down('md')]: {
      maxWidth: 'unset',
    },
  },
  button: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

interface Props {
  linodeId: number | undefined;
  open: boolean;
  onClose: () => void;
}

export const MigrateLinode = React.memo((props: Props) => {
  const { linodeId, onClose, open } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

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

  const { events } = useEvents();

  const eventsForLinode = linodeId
    ? events.filter((event) => isEventRelevantToLinode(event, linodeId))
    : [];

  const {
    mutateAsync: migrateLinode,
    isLoading,
    error,
    reset,
  } = useLinodeMigrateMutation(linodeId ?? -1);

  const { data: profile } = useProfile();
  const { data: agreements } = useAccountAgreements(open);
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();
  const { data: regionsData } = useRegionsQuery();
  const flags = useFlags();

  const [selectedRegion, handleSelectRegion] = React.useState<string | null>(
    null
  );

  const [hasConfirmed, setConfirmed] = React.useState<boolean>(false);
  const [hasSignedAgreement, setHasSignedAgreement] = React.useState<boolean>(
    false
  );

  const showAgreement = Boolean(
    !profile?.restricted &&
      agreements?.eu_model === false &&
      isEURegion(selectedRegion)
  );

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

    const regionSupportsMetadata = (_region: string) =>
      regionsData
        ?.find((region) => region.id === _region)
        ?.capabilities.includes('Metadata') ?? false;

    const currentRegionSupportsMetadata = regionSupportsMetadata(linode.region);
    const selectedRegionSupportsMetadata = regionSupportsMetadata(
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
          timezone: profile?.timezone,
          format: 'H',
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
      title={`Migrate Linode ${linode.label ?? ''} to another region`}
      open={open}
      onClose={onClose}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      {error && <Notice error text={error?.[0].reason} />}
      <Typography className={classes.details} variant="h2">
        {newLabel}
      </Typography>
      {/*
         commenting out for now because we need further clarification from
         stakeholders about whether or not we want to prevent multiple cross-datacenter migrations.
         */}
      {/* <MigrationImminentNotice
        linodeID={props.linodeID}
        notifications={notifications}
      /> */}
      <CautionNotice
        linodeId={linodeId}
        setConfirmed={setConfirmed}
        hasConfirmed={hasConfirmed}
        migrationTimeInMins={migrationTimeInMinutes}
        metadataWarning={metadataMigrateWarning}
      />
      <ConfigureForm
        currentRegion={region}
        handleSelectRegion={handleSelectRegion}
        selectedRegion={selectedRegion}
      />
      <Box
        display="flex"
        justifyContent={showAgreement ? 'space-between' : 'flex-end'}
        alignItems="center"
        className={classes.buttonGroup}
      >
        {showAgreement ? (
          <EUAgreementCheckbox
            checked={hasSignedAgreement}
            onChange={(e) => setHasSignedAgreement(e.target.checked)}
            className={classes.agreement}
            centerCheckbox
          />
        ) : null}
        <Button
          buttonType="primary"
          disabled={
            !!disabledText ||
            !hasConfirmed ||
            !selectedRegion ||
            (showAgreement && !hasSignedAgreement)
          }
          loading={isLoading}
          onClick={handleMigrate}
          className={classes.button}
        >
          Enter Migration Queue
        </Button>
        {!!disabledText && <TooltipIcon text={disabledText} status="help" />}
      </Box>
    </Dialog>
  );
});

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
