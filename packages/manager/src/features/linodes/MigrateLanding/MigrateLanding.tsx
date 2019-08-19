import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Error from 'src/components/ErrorState';
import HelpIcon from 'src/components/HelpIcon';
import Loading from 'src/components/LandingLoading';
import Notice from 'src/components/Notice';

import { withLinodeDetailContext } from '../LinodesDetail/linodeDetailContext';
import LinodeControls from '../LinodesDetail/LinodesDetailHeader/LinodeControls';
import Notifications from '../LinodesDetail/LinodesDetailHeader/Notifications';
import LinodeBusyStatus from '../LinodesDetail/LinodeSummary/LinodeBusyStatus';

import { resetEventsPolling } from 'src/events';
import { displayType } from 'src/features/linodes/presentation';
import { ApplicationState } from 'src/store';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { linodeInTransition } from '../transitions';

import CautionNotice from './CautionNotice';
import ConfigureForm from './ConfigureForm';

import { scheduleOrQueueMigration } from 'src/services/linodes/linodeActions.ts';

import withRegions, {
  DefaultProps as RegionProps
} from 'src/containers/regions.container';

const useStyles = makeStyles((theme: Theme) => ({
  details: {
    marginTop: theme.spacing(2)
  },
  actionWrapper: {
    marginTop: theme.spacing(2)
  }
}));

type CombinedProps = LinodeContextProps &
  WithTypesAndImages &
  RegionProps &
  RouteComponentProps<{}>;

const MigrateLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [selectedRegion, handleSelectRegion] = React.useState<string | null>(
    null
  );
  const [regionError, setRegionError] = React.useState<string>('');
  const [acceptError, setAcceptError] = React.useState<string>('');
  const [APIError, setAPIError] = React.useState<string>('');
  const [hasConfirmed, setConfirmed] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(false);

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
    regionsData,
    regionsError,
    regionsLoading,
    regionsLastUpdated
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
      region: selectedRegion
    })
      .then(() => {
        resetEventsPolling();
        setLoading(false);
        props.history.push(`/linodes/${linodeId}`);
      })
      .catch((e: Linode.ApiFieldError[]) => {
        setLoading(false);
        setAPIError(e[0].reason);
      });
  };

  const recentEvent = linodeEvents[0];

  const newLabel = getLinodeDescription(
    displayType(type, types || []),
    linodeSpecs.memory,
    linodeSpecs.disk,
    linodeSpecs.vcpus,
    image.id,
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
    props.linodeStatus
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
                pathname: `/linodes/${linodeId}/summary`
              },
              noCap: true
            }
          ]
        }}
      />
      {linodeInTransition(linodeStatus, recentEvent) && <LinodeBusyStatus />}
      <Typography className={classes.details} variant="h2">
        {newLabel}
      </Typography>
      <CautionNotice
        linodeVolumes={props.linodeVolumes}
        setConfirmed={setConfirmed}
        hasConfirmed={hasConfirmed}
        error={acceptError}
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
  linodeStatus: Linode.LinodeStatus;
  linodeSpecs: Linode.LinodeSpecs;
  linodeEvents: Linode.Event[];
  type: string | null;
  image: Linode.Image;
  linodeVolumes: Linode.Volume[];
  recentEvents: Linode.Event[];
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
  recentEvents: linode._events
}));

interface WithTypesAndImages {
  types: Linode.LinodeType[];
  images: Linode.Image[];
}

const mapStateToProps: MapStateToProps<
  WithTypesAndImages,
  {},
  ApplicationState
> = (state, ownProps) => ({
  types: state.__resources.types.entities,
  images: state.__resources.images.entities
});

const withTypes = connect(mapStateToProps);

export default compose<CombinedProps, {}>(
  withTypes,
  withRegions(),
  linodeContext,
  React.memo
)(MigrateLanding);

const getDisabledReason = (events: Linode.Event[], linodeStatus: string) => {
  if (events[0]) {
    if (
      events[0].action === 'linode_migrate_datacenter' &&
      events[0].percent_complete !== 100
    ) {
      return `Your Linode is currently being migrated.`;
    }
  }

  if (linodeStatus !== 'offline') {
    return 'Your Linode must be shut down first.';
  }

  return '';
};
