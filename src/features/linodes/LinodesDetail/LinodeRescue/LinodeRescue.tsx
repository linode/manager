import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { assoc, clamp, compose, map, path, pathOr } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import withVolumes from 'src/containers/volumes.container';
import { resetEventsPolling } from 'src/events';
import { withLinode } from 'src/features/linodes/LinodesDetail/context';
import { getLinodeDisks, rescueLinode } from 'src/services/linodes';
import createDevicesFromStrings, { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
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

interface WithVolumesProps {
  volumesData: ExtendedVolume[];
  volumesLoading: boolean;
  volumesError?: Linode.ApiFieldError[];
}

interface PromiseLoaderProps {
  disks: PromiseLoaderResponse<ExtendedDisk[]>;
}

interface State {
  rescueDevices: DevicesAsStrings;
  errors?: Linode.ApiFieldError[];
  devices: {
    disks: ExtendedDisk[];
  };
  config?: Linode.Config;
  counter: number;
}

type CombinedProps = PromiseLoaderProps
  & ContextProps
  & WithVolumesProps
  & WithStyles<ClassNames>
  & InjectedNotistackProps;

export class LinodeRescue extends React.Component<CombinedProps, State> {
  state: State = {
    devices: {
      disks: this.props.disks.response || [],
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
  }

  onSubmit = () => {
    const { linodeId, enqueueSnackbar } = this.props;
    const { rescueDevices } = this.state;

    rescueLinode(linodeId, createDevicesFromStrings(rescueDevices))
      .then((_) => {
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
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info'
        });
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        pathOr(
          [{ reason: 'There was an issue rescuing your Linode.' }],
          ['response', 'data', 'errors'],
          errorResponse
         )
          .forEach((err: Linode.ApiFieldError) => enqueueSnackbar(err.reason, {
            variant: 'error'
          }));
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
      volumesData,
      volumesError,
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
      const errorText = getErrorStringOrDefault(volumesError,
        "There was an error retrieving volumes information.")
      return (
        <React.Fragment>
          <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
          <ErrorState errorText={errorText} />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
        <Paper className={classes.root}>
          <Typography
            role="header"
            variant="h2"
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
            devices={{disks: devices.disks, volumes: volumesData}}
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
            <Button onClick={this.onSubmit} type="primary" data-qa-submit>Submit</Button>
          </ActionsPanel>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export const preloaded = PromiseLoader({
  /** @todo filter for available */
  disks: ({ linodeId }): Promise<ExtendedDisk[]> => getLinodeDisks(linodeId)
    .then(
      compose(
        map((disk: Linode.Disk) => assoc('_id', `disk-${disk.id}`, disk)),
        path(['data']),
      ),
  ),
});

// @todo remove context
const linodeContext = withLinode((context) => ({
  linodeId: context.data!.id,
  linodeRegion: context.data!.region,
  linodeLabel: context.data!.label,
}));

export default compose(
  linodeContext,
  preloaded,
  SectionErrorBoundary,
  styled,
  withSnackbar,
  withVolumes((ownProps: CombinedProps, volumesData, volumesLoading, volumesError) => {
    return {
      ...ownProps,
      volumesLoading,
      volumesError,
      volumesData: volumesData.reduce((accumulator, volume) => {
        if (
          (volume.id === ownProps.linodeId || volume.linode_id === null)
          && volume.region === ownProps.linodeRegion
        ) {
          /* Volume is attached to this Linode, or in the same region and unattached.
          * Include it in the list of Volumes to be shown as options to the user */
         return {
           ...volume,
           _id: `volume-${volume.id}`,
         }
        } else {
          return accumulator;
        }
      }, []),
    }
  }),
)(LinodeRescue);
