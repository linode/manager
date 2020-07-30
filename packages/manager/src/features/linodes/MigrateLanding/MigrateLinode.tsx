import { Event, Notification } from '@linode/api-v4/lib/account';
import { scheduleOrQueueMigration } from '@linode/api-v4/lib/linodes';
import { APIError as APIErrorType } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { compose } from 'recompose';
import Dialog from 'src/components/Dialog';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Error from 'src/components/ErrorState';
import HelpIcon from 'src/components/HelpIcon';
import Loading from 'src/components/LandingLoading';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import { displayType } from 'src/features/linodes/presentation';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import { useImages } from 'src/hooks/useImages';
import { useRegions } from 'src/hooks/useRegions';
import { useTypes } from 'src/hooks/useTypes';
import { ApplicationState } from 'src/store';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import CautionNotice from './CautionNotice';
import ConfigureForm from './ConfigureForm';
import { MBpsInterDC } from 'src/constants';
import { addUsedDiskSpace } from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeDiskSpace';
import { formatDate } from 'src/utilities/formatDate';
import { sendMigrationInitiatedEvent } from 'src/utilities/ga';

const useStyles = makeStyles((theme: Theme) => ({
  details: {
    marginTop: theme.spacing(2)
  },
  actionWrapper: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

interface Props {
  linodeID: number;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & WithTypesAndImages;

const MigrateLanding: React.FC<CombinedProps> = props => {
  const { linodeID, notifications, onClose, open } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const regions = useRegions();
  const { types } = useTypes();
  const linode = useExtendedLinode(linodeID);
  const { images } = useImages();

  const [selectedRegion, handleSelectRegion] = React.useState<string | null>(
    null
  );
  const [regionError, setRegionError] = React.useState<string>('');
  const [acceptError, setAcceptError] = React.useState<string>('');
  const [APIError, setAPIError] = React.useState<string>('');
  const [hasConfirmed, setConfirmed] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    scrollErrorIntoView();
  }, [regionError, APIError, acceptError]);

  if (!linode) {
    return null;
  }

  const region = {
    region: linode.region,
    countryCode: getCountryCodeFromSlug(linode.region)
  };

  const handleMigrate = () => {
    setRegionError('');
    setAcceptError('');
    setAPIError('');

    /** region is an optional param so enforce it client-side */
    if (!selectedRegion) {
      setRegionError('Please select a region.');
    }

    if (!hasConfirmed) {
      setAcceptError('Please accept the conditions of this migration.');
    }

    if (!selectedRegion || !hasConfirmed) {
      return;
    }

    setLoading(true);

    return scheduleOrQueueMigration(linodeID, {
      region: selectedRegion
    })
      .then(() => {
        resetEventsPolling();
        setLoading(false);
        sendMigrationInitiatedEvent(
          region.region,
          selectedRegion,
          +formatDate(new Date().toISOString(), {
            format: 'H'
          })
        );
        enqueueSnackbar(
          'Your Linode has entered the migration queue and will begin migration shortly.',
          { variant: 'success' }
        );
        onClose();
      })
      .catch((e: APIErrorType[]) => {
        setLoading(false);
        setAPIError(e[0].reason);
      });
  };

  const newLabel = getLinodeDescription(
    displayType(linode.type, types.entities || []),
    linode.specs.memory,
    linode.specs.disk,
    linode.specs.vcpus,
    linode.image ?? null,
    images.itemsById
  );

  if (regions.loading && regions.lastUpdated === 0) {
    return <Loading shouldDelay />;
  }

  if (regions.error) {
    return (
      <Error errorText="There was an issue loading configuration options." />
    );
  }

  if (regions.entities.length === 0 && regions.lastUpdated !== 0) {
    return null;
  }

  const disabledText = getDisabledReason(
    linode._events,
    linode.status,
    linodeID,
    notifications
  );

  /** how long will this take to migrate when the migration starts */
  const migrationTimeInMinutes = Math.ceil(
    addUsedDiskSpace(linode._disks) / MBpsInterDC / 60
  );

  return (
    <Dialog
      title={`Migrate ${linode.label ?? ''}`}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      {APIError && <Notice error text={APIError} />}

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
        linodeVolumes={linode._volumes}
        setConfirmed={setConfirmed}
        hasConfirmed={hasConfirmed}
        error={acceptError}
        migrationTimeInMins={migrationTimeInMinutes}
      />
      <ConfigureForm
        currentRegion={region}
        allRegions={regions.entities}
        handleSelectRegion={handleSelectRegion}
        selectedRegion={selectedRegion}
        errorText={regionError}
      />
      <div className={classes.actionWrapper}>
        <Button
          disabled={!!disabledText}
          buttonType="primary"
          onClick={handleMigrate}
          loading={isLoading}
        >
          Enter Migration Queue
        </Button>
        {!!disabledText && <HelpIcon text={disabledText} />}
      </div>
    </Dialog>
  );
};

interface WithTypesAndImages {
  notifications: Notification[];
}

const mapStateToProps: MapStateToProps<
  WithTypesAndImages,
  {},
  ApplicationState
> = state => ({
  notifications: state.__resources.notifications.data || []
});

const withReduxState = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  withReduxState,
  React.memo
)(MigrateLanding);

const getDisabledReason = (
  events: Event[],
  linodeStatus: string,
  linodeID: number,
  notifications: Notification[]
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

export const getCountryCodeFromSlug = (regionSlug: string) => {
  if (regionSlug.match(/ap-north/i)) {
    return 'jp';
  }

  if (regionSlug.match(/ap-south/i)) {
    return 'sg';
  }

  if (regionSlug.match(/eu-cent/i)) {
    return 'de';
  }

  if (regionSlug.match(/eu/i)) {
    return 'uk';
  }

  if (regionSlug.match(/ap-west/i)) {
    return 'in';
  }

  if (regionSlug.match(/ap-southeast/i)) {
    return 'au';
  }

  if (regionSlug.match(/ca-cent/i)) {
    return 'ca';
  }

  return 'us';
};
