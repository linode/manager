import { withSnackbar, WithSnackbarProps } from 'notistack';
import { assoc, clamp, compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import withVolumes from 'src/containers/volumes.container';
import { resetEventsPolling } from 'src/events';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { rescueLinode } from 'src/services/linodes';
import { MapState } from 'src/store/types';
import createDevicesFromStrings, {
  DevicesAsStrings
} from 'src/utilities/createDevicesFromStrings';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import LinodePermissionsError from '../LinodePermissionsError';
import DeviceSelection, {
  ExtendedDisk,
  ExtendedVolume
} from './DeviceSelection';

type ClassNames = 'root' | 'title' | 'intro';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit,
    '& .iconTextLink': {
      display: 'inline-flex',
      margin: `${theme.spacing.unit * 3}px 0 0 0`
    }
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  intro: {
    marginBottom: theme.spacing.unit * 2
  }
});

interface ContextProps {
  linodeId: number;
  linodeRegion?: string;
  linodeLabel: string;
  linodeDisks?: ExtendedDisk[];
  permissions: Linode.GrantLevel;
}

interface StateProps {
  diskError?: string;
}

interface VolumesProps {
  volumesData: ExtendedVolume[];
  volumesError?: string;
}

interface State {
  rescueDevices: DevicesAsStrings;
  errors?: Linode.ApiFieldError[];
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  config?: Linode.Config;
  counter: number;
}

type CombinedProps = VolumesProps &
  StateProps &
  ContextProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

export class LinodeRescue extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    const filteredVolumes = props.volumesData
      ? props.volumesData.filter(volume => {
          // whether volume is not attached to any Linode
          const volumeIsUnattached = volume.linode_id === null;
          // whether volume is attached to the current Linode we're viewing
          const volumeIsAttachedToCurrentLinode =
            volume.linode_id === props.linodeId;
          // whether volume is in the same region as the current Linode we're viewing
          const volumeAndLinodeRegionMatch =
            props.linodeRegion === volume.region;
          return (
            (volumeIsAttachedToCurrentLinode || volumeIsUnattached) &&
            volumeAndLinodeRegionMatch
          );
        })
      : [];
    this.state = {
      devices: {
        disks: props.linodeDisks || [],
        volumes: filteredVolumes || []
      },
      counter: 1,
      rescueDevices: {
        sda: undefined,
        sdb: undefined,
        sdc: undefined,
        sdd: undefined,
        sde: undefined,
        sdf: undefined,
        sdg: undefined,
        sdh: undefined
      }
    };
  }

  onSubmit = () => {
    const { linodeId, enqueueSnackbar } = this.props;
    const { rescueDevices } = this.state;

    rescueLinode(linodeId, createDevicesFromStrings(rescueDevices))
      .then(response => {
        this.setState({
          counter: 1,
          rescueDevices: {
            sda: undefined,
            sdb: undefined,
            sdc: undefined,
            sdd: undefined,
            sde: undefined,
            sdf: undefined,
            sdg: undefined,
            sdh: undefined
          }
        });
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info'
        });
        resetEventsPolling();
      })
      .catch(errorResponse => {
        getAPIErrorOrDefault(
          errorResponse,
          'There was an issue rescuing your Linode.'
        ).forEach((err: Linode.ApiFieldError) =>
          enqueueSnackbar(err.reason, {
            variant: 'error'
          })
        );
      });
  };

  incrementCounter = () => {
    this.setState({ counter: clamp(1, 6, this.state.counter + 1) });
  };

  /** string format is type-id */
  onChange = (slot: string, _id: string) =>
    this.setState({
      rescueDevices: {
        ...this.state.rescueDevices,
        [slot]: _id
      }
    });

  render() {
    const { devices } = this.state;
    const {
      diskError,
      volumesError,
      classes,
      linodeLabel,
      permissions
    } = this.props;
    const disabled = permissions === 'read_only';

    if (diskError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
          <ErrorState errorText="There was an error retrieving disks information." />
        </React.Fragment>
      );
    }

    if (volumesError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
          <ErrorState errorText="There was an error retrieving volumes information." />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
        <Paper className={classes.root}>
          {disabled && <LinodePermissionsError />}
          <Typography
            role="header"
            variant="h2"
            className={classes.title}
            data-qa-title
          >
            Rescue
          </Typography>
          <Typography className={classes.intro}>
            If you suspect that your primary filesystem is corrupt, use the
            Linode Manager to boot your Linode into Rescue Mode. This is a safe
            environment for performing many system recovery and disk management
            tasks.
          </Typography>
          <DeviceSelection
            slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
            devices={devices}
            onChange={this.onChange}
            getSelected={slot =>
              pathOr('', ['rescueDevices', slot], this.state)
            }
            counter={this.state.counter}
            rescue
            disabled={disabled}
          />
          <AddNewLink
            onClick={this.incrementCounter}
            label="Add Disk"
            disabled={disabled || this.state.counter >= 6}
            left
          />
          <ActionsPanel>
            <Button
              onClick={this.onSubmit}
              type="primary"
              data-qa-submit
              disabled={disabled}
            >
              Submit
            </Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  linodeRegion: linode.region,
  linodeLabel: linode.label,
  linodeDisks: linode._disks.map(disk => assoc('_id', `disk-${disk.id}`, disk)),
  permissions: linode._permissions
}));

const mapStateToProps: MapState<StateProps, CombinedProps> = state => ({
  diskError: pathOr(undefined, ['__resources', 'linodeDisks', 'error'], state)
});

const connected = connect(mapStateToProps);

export default compose(
  linodeContext,
  SectionErrorBoundary,
  styled,
  withSnackbar,
  withVolumes((ownProps, volumesData, volumesLoading, volumesError) => {
    const mappedData = volumesData.items.map(id => ({
      ...volumesData.itemsById[id],
      _id: `volume-${id}`
    }));
    return {
      ...ownProps,
      volumesData: mappedData,
      volumesError
    };
  }),
  connected
)(LinodeRescue);
