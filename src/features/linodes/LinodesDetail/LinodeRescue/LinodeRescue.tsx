import * as React from 'react';
import {
  assoc,
  clamp,
  compose,
  map,
  path,
  pathOr,
  prop,
} from 'ramda';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import {
  rescueLinode,
  getLinodeDisks,
} from 'src/services/linodes';
import { getVolumes } from 'src/services/volumes';
import { resetEventsPolling } from 'src/events';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import ActionsPanel from 'src/components/ActionsPanel';
import ErrorState from 'src/components/ErrorState';
import DeviceSelection, { ExtendedDisk, ExtendedVolume } from './DeviceSelection';
import createDevicesFromStrings, { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';

type ClassNames = 'root'
  | 'title'
  | 'intro'
  | 'actionPanel';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 1,
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
  actionPanel: {
    padding: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 3,
  },
});

interface Props {
  linodeId: number;
  linodeRegion?: string;
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

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;



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
    const { disks: { error: disksError }, volumes: { error: volumesError }, classes } = this.props;

    if (disksError) {
      return <ErrorState errorText="There was an error retrieving disks information." />;
    }

    if (volumesError) {
      return <ErrorState errorText="There was an error retrieving volumes information." />;
    }

    return (
      <React.Fragment>
        <Paper className={classes.root}>
          <Typography
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
          <IconTextLink
            SideIcon={PlusSquare}
            onClick={() => this.incrementCounter()}
            text="Add Disk"
            title="Add Disk"
            data-qa-oauth-create
            disabled={this.state.counter >= 6}
          />
        </Paper>
        <ActionsPanel className={classes.actionPanel}>
          <Button onClick={this.onSubmit} variant="raised" color="primary">Submit</Button>
        </ActionsPanel>
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
        ExtendedVolume[]
        >(
          map(volume => assoc('_id', `volume-${volume.id}`, volume)),
          prop('data'),
      ),
  ),
});

export default compose<any, any, any, any>(
  preloaded,
  SectionErrorBoundary,
  styled,
)(LinodeRescue);

