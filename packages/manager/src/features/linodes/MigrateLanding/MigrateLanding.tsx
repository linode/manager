import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { withLinodeDetailContext } from '../LinodesDetail/linodeDetailContext';
import LinodeControls from '../LinodesDetail/LinodesDetailHeader/LinodeControls';
import MutationNotification from '../LinodesDetail/LinodesDetailHeader/MutationNotification';
import Notifications from '../LinodesDetail/LinodesDetailHeader/Notifications';
import LinodeBusyStatus from '../LinodesDetail/LinodeSummary/LinodeBusyStatus';
import { linodeInTransition } from '../transitions';

import Typography from 'src/components/core/Typography';
import { displayType } from 'src/features/linodes/presentation';
import { ApplicationState } from 'src/store';
import getLinodeDescription from 'src/utilities/getLinodeDescription';
import CautionNotice from './CautionNotice';

const useStyles = makeStyles((theme: Theme) => ({
  details: {
    marginTop: theme.spacing(2)
  }
}));

type CombinedProps = LinodeContextProps & WithTypesAndImages;

const MigrateLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    label,
    disks,
    linodeId,
    linodeStatus,
    linodeEvents,
    linodeSpecs,
    types,
    type,
    image,
    images
  } = props;

  const recentEvent = linodeEvents[0];

  const newLabel = getLinodeDescription(
    displayType(type, types || []),
    linodeSpecs.memory,
    linodeSpecs.disk,
    linodeSpecs.vcpus,
    image.id,
    images
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Migrate" />
      <MutationNotification disks={disks} />
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
      <CautionNotice linodeVolumes={props.linodeVolumes} />
    </React.Fragment>
  );
};

interface LinodeContextProps {
  linodeId: number;
  region: string;
  disks: Linode.Disk[];
  label: string;
  linodeStatus: Linode.LinodeStatus;
  linodeSpecs: Linode.LinodeSpecs;
  linodeEvents: Linode.Event[];
  type: string | null;
  image: Linode.Image;
  linodeVolumes: Linode.Volume[];
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  region: linode.region,
  disks: linode._disks,
  type: linode.type,
  label: linode.label,
  image: linode.image,
  linodeSpecs: linode.specs,
  linodeStatus: linode.status,
  linodeEvents: linode._events,
  linodeVolumes: linode._volumes
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
  linodeContext,
  React.memo
)(MigrateLanding);
