import * as React from 'react';
import {
  always,
  assoc,
  clamp,
  compose,
  concat,
  contains,
  defaultTo,
  filter,
  ifElse,
  isNil,
  last,
  map,
  objOf,
  path,
  prop,
  split,
  pathOr,
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
  rescue as rescueLinode,
  getDisks as getLinodeDisks,
  RescueRequestObject,
} from 'src/services/linodes';
import { getVolumes } from 'src/services/volumes';
import { resetEventsPolling } from 'src/events';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import ActionsPanel from 'src/components/ActionsPanel';
import ErrorState from 'src/components/ErrorState';
import DeviceSelection from './DeviceSelection';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  linodeId: number;
}

interface PromiseLoaderProps {
  disks: PromiseLoaderResponse<Linode.Disk>;
  volumes: PromiseLoaderResponse<Linode.Volume>;
}

interface RescueDeviceState {
  sda?: string;
  sdb?: string;
  sdc?: string;
  sdd?: string;
  sde?: string;
  sdf?: string;
  sdg?: string;
  sdh?: string;
}

interface State {
  rescueDevices: RescueDeviceState;
  errors?: Linode.ApiFieldError[];
  disks?: Linode.Disk;
  volumes?: Linode.Volume;
  config?: Linode.Config;
  counter: number;
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;

let getIdOrNullFor: (t: string) => (d?: string) => null | Linode.VolumeDevice | Linode.DiskDevice;
getIdOrNullFor = type => compose(
  ifElse(isNil, always(null), compose(
    ifElse(
      contains(type),
      compose<string, string[], string, number, Record<string, number>>(
        objOf(`${type}_id`), Number, last, split('-'),
      ),
      always(null),
    ),
  )),
);

const idForDisk = getIdOrNullFor('disk');
const idForVolume = getIdOrNullFor('volume');

export let createRescueDevicesPostObject: (v: RescueDeviceState) => RescueRequestObject;
createRescueDevicesPostObject = devices => ({
  sda: idForDisk(devices.sda) || idForVolume(devices.sda),
  sdb: idForDisk(devices.sdb) || idForVolume(devices.sdb),
  sdc: idForDisk(devices.sdc) || idForVolume(devices.sdc),
  sdd: idForDisk(devices.sdd) || idForVolume(devices.sdd),
  sde: idForDisk(devices.sde) || idForVolume(devices.sde),
  sdf: idForDisk(devices.sdf) || idForVolume(devices.sdf),
  sdg: idForDisk(devices.sdg) || idForVolume(devices.sdg),
});


class LinodeRescue extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      counter: 2,
      disks: props.disks.response,
      volumes: props.volumes.response,
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

    rescueLinode(linodeId, createRescueDevicesPostObject(rescueDevices))
      .then((response) => {
        resetEventsPolling();
        /** @todo What is the result here? Toast? Redirect? Brimstone and fire? */
      })
      .catch((errorResponse) => {
        pathOr([], ['response', 'data', 'errors'], errorResponse)
          .forEach((err: Linode.ApiFieldError) => sendToast(err.reason, 'error'));
      });
  }

  incrementCounter = () => {
    this.setState(
      { counter: clamp(2, 7, this.state.counter + 1) },
    );
  }

  /** string format is type-id */
  onChange = (key: string) => (_id: string) => this.setState({
    rescueDevices: {
      ...this.state.rescueDevices,
      [key]: _id,
    },
  })

  onSdaChange = this.onChange('sda');
  onSdbChange = this.onChange('sdb');
  onSdcChange = this.onChange('sdc');
  onSddChange = this.onChange('sdd');
  onSdeChange = this.onChange('sde');
  onSdfChange = this.onChange('sdf');
  onSdgChange = this.onChange('sdg');

  render() {
    const { disks, volumes } = this.state;
    const { disks: { error: disksError }, volumes: { error: volumesError } } = this.props;

    if (disksError) {
      return <ErrorState errorText="There was an error retrieving disks information." />;
    }

    if (volumesError) {
      return <ErrorState errorText="There was an error retrieving volumes information." />;
    }

    return (
      <Paper>
        <Typography variant="headline">Rescue</Typography>
        <Typography>
          If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot
          your Linode into Rescue Mode. This is a safe environment for performing many system
          recovery and disk management tasks.
        </Typography>
        {
          compose<any, any, any, any>(
            (devices: (Linode.Disk & { _id: string } | Linode.Volume & { _id: string })[]) =>
              <DeviceSelection
                devices={devices}
                onSdaChange={this.onSdaChange}
                selectedSda={this.state.rescueDevices.sda}
                onSdbChange={this.onSdbChange}
                selectedSdb={this.state.rescueDevices.sdb}
                onSdcChange={this.onSdcChange}
                selectedSdc={this.state.rescueDevices.sdc}
                onSddChange={this.onSddChange}
                selectedSdd={this.state.rescueDevices.sdd}
                onSdeChange={this.onSdeChange}
                selectedSde={this.state.rescueDevices.sde}
                onSdfChange={this.onSdfChange}
                selectedSdf={this.state.rescueDevices.sdf}
                onSdgChange={this.onSdgChange}
                selectedSdg={this.state.rescueDevices.sdg}
                counter={this.state.counter}
              />,
            (disks, volumes) => concat(defaultTo([], disks), defaultTo([], volumes)),
          )(disks, volumes)
        }
        <IconTextLink
          SideIcon={PlusSquare}
          onClick={() => this.incrementCounter()}
          text="Add Disk"
          title="Add Disk"
          data-qa-oauth-create
          disabled={this.state.counter >= 7}
        />
        <ActionsPanel>
          <Button onClick={this.onSubmit} variant="raised" color="primary">Submit</Button>
        </ActionsPanel>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });


interface VolumeWithID extends Linode.Volume {
  _id: string;
}
const preloaded = PromiseLoader({
  /** @todo filter for available */
  disks: ({ linodeId }) => getLinodeDisks(linodeId)
    .then(
      compose(
        map((disk: Linode.Disk) => assoc('_id', `disk-${disk.id}`, disk)),
        path(['data']),
      ),
  ),

  /** @todo filter for available */
  volumes: ({ linodeId, linodeRegion }) => getVolumes()
    .then(
      compose<
        Linode.ManyResourceState<Linode.Volume>,
        Linode.Volume[],
        VolumeWithID[],
        VolumeWithID[]
        >(
          filter<VolumeWithID>(volume => volume.region === linodeRegion),
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
