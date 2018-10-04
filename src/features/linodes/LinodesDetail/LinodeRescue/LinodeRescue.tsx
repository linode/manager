import { assoc, clamp, compose, map, path, pathOr, prop } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import { resetEventsPolling } from 'src/events';
import { withLinode } from 'src/features/linodes/LinodesDetail/context';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getLinodeDisks, rescueLinode } from 'src/services/linodes';
import { getVolumes } from 'src/services/volumes';
import createDevicesFromStrings, { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';

import DeviceSelection, { ExtendedDisk, ExtendedVolume } from './DeviceSelection';

type ClassNames = 'root'
  | 'title'
  | 'intro';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit,
    '& .iconTextLink': {
      display: 'inline-flex',
      margin: `${theme.spacing.unit * 3}px 0 0 0`,
    },
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  intro: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface ContextProps {
  linodeId: number;
  linodeRegion?: string;
  linodeLabel: string;
}

interface PromiseLoaderProps {
  disks: PromiseLoaderResponse<ExtendedDisk[]>;
  volumes: PromiseLoaderResponse<ExtendedVolume[]>;
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

type CombinedProps = PromiseLoaderProps & ContextProps & WithStyles<ClassNames>;

export class LinodeRescue extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    const filteredVolumes = props.volumes.response.filter((volume) => {
      // whether volume is not attached to any Linode
      const volumeIsUnattached = volume.linode_id === null;
      // whether volume is attached to the current Linode we're viewing
      const volumeIsAttachedToCurrentLinode = volume.linode_id === props.linodeId;
      // whether volume is in the same region as the current Linode we're viewing
      const volumeAndLinodeRegionMatch = props.linodeRegion === volume.region;
      return (volumeIsAttachedToCurrentLinode || volumeIsUnattached) && volumeAndLinodeRegionMatch;
    });
    this.state = {
      devices: {
        disks: props.disks.response || [],
        volumes: filteredVolumes || [],
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
        sdh: undefined,
      },
    };
  }

  onSubmit = () => {
    const { linodeId } = this.props;
    const { rescueDevices } = this.state;

    rescueLinode(linodeId, createDevicesFromStrings(rescueDevices))
      .then((response) => {
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
            sdh: undefined,
          },
        });
        sendToast('Linode rescue started.');
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
  }

  incrementCounter = () => {
    this.setState(
      { counter: clamp(1, 6, this.state.counter + 1) },
    );
  }

  /** string format is type-id */
  onChange = (slot: string, _id: string) => this.setState({
    rescueDevices: {
      ...this.state.rescueDevices,
      [slot]: _id,
    },
  })

  render() {
    const { devices } = this.state;
    const { 
      disks: { error: disksError },
      volumes: { error: volumesError },
      classes,
      linodeLabel,
    } = this.props;

    if (disksError) {
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
          <Typography
            role="header"
            variant="headline"
            className={classes.title}
            data-qa-title
          >
            Rescue
          </Typography>
          <Typography className={classes.intro}>
            If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot
            your Linode into Rescue Mode. This is a safe environment for performing many system
            recovery and disk management tasks.
          </Typography>
          <DeviceSelection
            slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
            devices={devices}
            onChange={this.onChange}
            getSelected={slot => pathOr('', ['rescueDevices', slot], this.state)}
            counter={this.state.counter}
            rescue
          />
          <AddNewLink
            onClick={this.incrementCounter}
            label="Add Disk"
            disabled={this.state.counter >= 6}
            left
          />
          <ActionsPanel>
            <Button onClick={this.onSubmit} variant="raised" color="primary">Submit</Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export const preloaded = PromiseLoader({
  /** @todo filter for available */
  disks: ({ linodeId }): Promise<ExtendedDisk[]> => getLinodeDisks(linodeId)
    .then(
      compose(
        map((disk: Linode.Disk) => assoc('_id', `disk-${disk.id}`, disk)),
        path(['data']),
      ),
  ),

  /** @todo filter for available */
  volumes: ({ linodeId, linodeRegion }): Promise<ExtendedVolume[]> => getVolumes()
    .then(
      compose<
        Linode.ResourcePage<Linode.Volume>,
        Linode.Volume[],
        ExtendedVolume[]>(
          map(volume => assoc('_id', `volume-${volume.id}`, volume)),
          prop('data'),
      ),
  ),
});

const linodeContext = withLinode((context) => ({
  linodeId: context.data!.id,
  linodeRegion: context.data!.region,
  linodeLabel: context.data!.label,
}));

export default compose<any, any, any, any, any>(
  linodeContext,
  preloaded,
  SectionErrorBoundary,
  styled,
)(LinodeRescue);
