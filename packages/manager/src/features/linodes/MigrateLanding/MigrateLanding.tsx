import { Event, Notification } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import {
  Disk,
  LinodeSpecs,
  LinodeStatus,
  LinodeType,
  scheduleOrQueueMigration,
} from '@linode/api-v4/lib/linodes';
import { APIError as APIErrorType } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Error from 'src/components/ErrorState';
import HelpIcon from 'src/components/HelpIcon';
import Loading from 'src/components/LandingLoading';
import Notice from 'src/components/Notice';
import { MBpsInterDC } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { addUsedDiskSpace } from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeDiskSpace';
import { displayType } from 'src/features/linodes/presentation';
import { useRegionsQuery } from 'src/queries/regions';
import { ApplicationState } from 'src/store';
import { formatDate } from 'src/utilities/formatDate';
import { sendMigrationInitiatedEvent } from 'src/utilities/ga';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../LinodesDetail/linodeDetailContext';
import LinodeControls from '../LinodesDetail/LinodesDetailHeader/LinodeControls';
import Notifications from '../LinodesDetail/LinodesDetailHeader/Notifications';
import LinodeBusyStatus from '../LinodesDetail/LinodeSummary/LinodeBusyStatus';
import { linodeInTransition } from '../transitions';
import CautionNotice from './CautionNotice';
import ConfigureForm from './ConfigureForm';

const useStyles = makeStyles((theme: Theme) => ({
  details: {
    marginTop: theme.spacing(2),
  },
  actionWrapper: {
    marginTop: theme.spacing(2),
  },
}));

type CombinedProps = LinodeContextProps & WithTypesAndImages;

const MigrateLanding: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const [selectedRegion, handleSelectRegion] = React.useState<string | null>(
    null
  );
  const [regionError, setRegionError] = React.useState<string>('');
  const [acceptError, setAcceptError] = React.useState<string>('');
  const [APIError, setAPIError] = React.useState<string>('');
  const [hasConfirmed, setConfirmed] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const {
    data,
    isLoading: regionsLoading,
    error: regionsError,
    dataUpdatedAt: regionsLastUpdated,
  } = useRegionsQuery();
  const regionsData = data ?? [];

  const {
    label,
    linodeId,
    region,
    linodeStatus,
    linodeEvents,
    linodeSpecs,
    types,
    type,
    image,
    images,
    notifications,
  } = props;

  React.useEffect(() => {
    scrollErrorIntoView();
  }, [regionError, APIError, acceptError]);

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

    return scheduleOrQueueMigration(linodeId, {
      region: selectedRegion,
    })
      .then(() => {
        resetEventsPolling();
        setLoading(false);
        sendMigrationInitiatedEvent(
          region,
          selectedRegion,
          +formatDate(new Date().toISOString(), {
            format: 'H',
          })
        );
        history.push(`/linodes/${linodeId}`);
      })
      .catch((e: APIErrorType[]) => {
        setLoading(false);
        setAPIError(e[0].reason);
      });
  };

  const firstEventWithProgress = (linodeEvents || []).find(
    (eachEvent) => typeof eachEvent.percent_complete === 'number'
  );

  const newLabel = getLinodeDescription(
    displayType(type, types || []),
    linodeSpecs.memory,
    linodeSpecs.disk,
    linodeSpecs.vcpus,
    image ? image.id : null,
    images
  );

  if (regionsLoading && regionsLastUpdated === 0) {
    return <Loading shouldDelay />;
  }

  if (regionsError) {
    return (
      <Error errorText="There was an issue loading configuration options." />
    );
  }

  if (regionsData.length === 0 && regionsLastUpdated !== 0) {
    return null;
  }

  const disabledText = getDisabledReason(
    props.recentEvents,
    props.linodeStatus,
    props.linodeId,
    notifications
  );

  /** how long will this take to migrate when the migration starts */
  const migrationTimeInMinutes = Math.ceil(
    addUsedDiskSpace(props.linodeDisks) / MBpsInterDC / 60
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Migrate" />
      {APIError && <Notice error text={APIError} />}
      <Notifications />
      <LinodeControls
        breadcrumbProps={{
          removeCrumbX: 4,
          crumbOverrides: [
            {
              label,
              position: 2,
              linkTo: {
                pathname: `/linodes/${linodeId}/summary`,
              },
              noCap: true,
            },
          ],
          onEditHandlers: undefined,
        }}
      />
      {linodeInTransition(linodeStatus, firstEventWithProgress) && (
        <LinodeBusyStatus />
      )}
      <Typography className={classes.details} variant="h2">
        {newLabel}
      </Typography>
      {/*
         commenting out for now because we need further clarification from
         stakeholders about whether or not we want to prevent multiple cross-datacenter migrations.
         */}
      {/* <MigrationImminentNotice
        linodeID={props.linodeId}
        notifications={notifications}
      /> */}
      <CautionNotice
        linodeVolumes={props.linodeVolumes}
        setConfirmed={setConfirmed}
        hasConfirmed={hasConfirmed}
        error={acceptError}
        migrationTimeInMins={migrationTimeInMinutes}
      />
      <ConfigureForm
        currentRegion={region}
        allRegions={regionsData}
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
    </React.Fragment>
  );
};

interface LinodeContextProps {
  linodeId: number;
  region: string;
  label: string;
  linodeStatus: LinodeStatus;
  linodeSpecs: LinodeSpecs;
  linodeEvents: Event[];
  type: string | null;
  image: Image;
  linodeVolumes: Volume[];
  recentEvents: Event[];
  linodeDisks: Disk[];
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  region: linode.region,
  type: linode.type,
  label: linode.label,
  image: linode.image,
  linodeSpecs: linode.specs,
  linodeStatus: linode.status,
  linodeEvents: linode._events,
  linodeVolumes: linode._volumes,
  recentEvents: linode._events,
  linodeDisks: linode._disks,
}));

interface WithTypesAndImages {
  types: LinodeType[];
  notifications: Notification[];
  images: Record<string, Image>;
}

const mapStateToProps: MapStateToProps<
  WithTypesAndImages,
  {},
  ApplicationState
> = (state) => ({
  types: state.__resources.types.entities,
  images: state.__resources.images.itemsById,
  notifications: state.__resources.notifications.data || [],
});

const withReduxState = connect(mapStateToProps);

export default compose<CombinedProps, {}>(
  withReduxState,
  linodeContext,
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
