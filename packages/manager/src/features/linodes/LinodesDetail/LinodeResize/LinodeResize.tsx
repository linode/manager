import { GrantLevel } from 'linode-js-sdk/lib/account';
import {
  Disk,
  LinodeStatus,
  LinodeType,
  resizeLinode
} from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { resetEventsPolling } from 'src/events';
import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { ApplicationState } from 'src/store';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import LinodePermissionsError from '../LinodePermissionsError';

import Checkbox from 'src/components/CheckBox';
import HelpIcon from 'src/components/HelpIcon';

type ClassNames =
  | 'root'
  | 'title'
  | 'subTitle'
  | 'toolTip'
  | 'currentPlanContainer'
  | 'resizeTitle'
  | 'checkbox'
  | 'currentHeaderEmptyCell';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(2),
      '& .tabbedPanel': {
        '& > div': {
          padding: 0
        }
      }
    },
    checkbox: {
      marginTop: theme.spacing(3)
    },
    toolTip: {
      paddingTop: theme.spacing(1)
    },
    title: {
      marginBottom: theme.spacing(2)
    },
    resizeTitle: {
      display: 'flex',
      alignItems: 'center',
      minHeight: '44px'
    },
    subTitle: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1)
    },
    currentPlanContainer: {
      '& input[type=radio]': {
        cursor: 'not-allowed'
      }
    },
    currentHeaderEmptyCell: {
      width: '13%'
    }
  });

interface LinodeContextProps {
  linodeId: number;
  linodeType: null | string;
  linodeStatus?: LinodeStatus;
  linodeLabel: string;
  permissions: GrantLevel;
  linodeDisks: Disk[];
}

interface State {
  selectedId: string;
  isLoading: boolean;
  errors?: APIError[];
  autoDiskResize: boolean;
}

type CombinedProps = WithTypesProps &
  RouteComponentProps &
  LinodeContextProps &
  WithStyles<ClassNames> &
  DispatchProps &
  WithSnackbarProps;

export class LinodeResize extends React.Component<CombinedProps, State> {
  state: State = {
    selectedId: '',
    isLoading: false,
    autoDiskResize: shouldEnableAutoResizeDiskOption(this.props.linodeDisks)[1]
  };

  static extendType = (type: LinodeType): ExtendedType => {
    const {
      label,
      memory,
      vcpus,
      disk,
      price: { monthly, hourly }
    } = type;

    const isGPU = type.class === 'gpu';

    return {
      ...type,
      heading: label,
      subHeadings: [
        `$${monthly}/mo ($${isGPU ? hourly.toFixed(2) : hourly}/hr)`,
        typeLabelDetails(memory, disk, vcpus)
      ]
    };
  };

  onSubmit = () => {
    const {
      linodeId,
      linodeType,
      enqueueSnackbar,
      history,
      updateLinode,
      currentTypesData
    } = this.props;
    const { selectedId } = this.state;

    if (!linodeId) {
      return;
    }

    const isSmaller = isSmallerThanCurrentPlan(
      selectedId,
      linodeType || '',
      currentTypesData
    );

    this.setState({ isLoading: true });

    /**
     * Only set the allow_auto_disk_resize flag to true if both the user
     * has selected it (this.state.autoDiskResize) and
     * the flag would be honored (so disable if the current plan
     * is larger than the target plan).
     */
    resizeLinode(linodeId, selectedId, this.state.autoDiskResize && !isSmaller)
      .then(_ => {
        this.setState({ selectedId: '', isLoading: false });
        resetEventsPolling();
        enqueueSnackbar('Linode queued for resize.', {
          variant: 'info'
        });

        // Update the Linode so we display the new plan information.
        // This is important if resizing from a legacy plan. We need
        // to do this in order for the "Upgrade available" banner to
        // go away.
        updateLinode(linodeId);

        history.push(`/linodes/${linodeId}/summary`);
      })
      .catch(errorResponse => {
        getAPIErrorOrDefault(
          errorResponse,
          'There was an issue resizing your Linode.'
        ).forEach((err: APIError) =>
          enqueueSnackbar(err.reason, {
            variant: 'error'
          })
        );
        this.setState({ selectedId: '', isLoading: false });
      });
  };

  handleSelectPlan = (id: string) => {
    this.setState({ selectedId: id });
  };

  handleToggleAutoDisksResize = () => {
    this.setState({ autoDiskResize: !this.state.autoDiskResize });
  };

  render() {
    const {
      currentTypesData,
      deprecatedTypesData,
      linodeType,
      linodeLabel,
      permissions,
      classes,
      linodeDisks
    } = this.props;
    const type = [...currentTypesData, ...deprecatedTypesData].find(
      t => t.id === linodeType
    );

    const disabled = permissions === 'read_only';

    const currentPlanHeading = linodeType
      ? type
        ? type.label
        : 'Unknown Plan'
      : 'No Assigned Plan';

    const [
      diskToResize,
      _shouldEnableAutoResizeDiskOption
    ] = shouldEnableAutoResizeDiskOption(linodeDisks);

    const isSmaller = isSmallerThanCurrentPlan(
      this.state.selectedId,
      linodeType || '',
      currentTypesData
    );

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Resize`} />
        <Paper className={classes.root}>
          {disabled && <LinodePermissionsError />}
          <Typography
            role="header"
            variant="h2"
            className={classes.title}
            data-qa-title
          >
            Resize
          </Typography>
          <Typography data-qa-description>
            If you're expecting a temporary burst of traffic to your website, or
            if you're not using your Linode as much as you thought, you can
            temporarily or permanently resize your Linode to a different plan.
          </Typography>

          <SelectPlanPanel
            currentPlanHeading={currentPlanHeading}
            types={this.props.currentTypesData}
            onSelect={this.handleSelectPlan}
            selectedID={this.state.selectedId}
            disabled={disabled}
          />
        </Paper>
        <Paper className={`${classes.checkbox} ${classes.root}`}>
          <Typography variant="h2" className={classes.resizeTitle}>
            Auto Resize Disk
            {isSmaller ? (
              <HelpIcon
                className={classes.toolTip}
                text={`Your disks cannot be automatically resized when moving to a smaller plan.`}
              />
            ) : !_shouldEnableAutoResizeDiskOption ? (
              <HelpIcon
                className={classes.toolTip}
                text={`Your ext disk can only be automatically resized if you have one ext
                      disk or one ext disk and one swap disk on this Linode.`}
              />
            ) : null}
          </Typography>
          <Checkbox
            disabled={!_shouldEnableAutoResizeDiskOption || isSmaller}
            checked={
              !_shouldEnableAutoResizeDiskOption || isSmaller
                ? false
                : this.state.autoDiskResize
            }
            onChange={this.handleToggleAutoDisksResize}
            text={
              !_shouldEnableAutoResizeDiskOption ? (
                `Would you like your disk on this Linode automatically resized to
            scale with this Linode's new size? We recommend you keep this option enabled.`
              ) : (
                <Typography>
                  Would you like the disk <strong>{diskToResize}</strong> to be
                  automatically scaled with this Linode's new size? We recommend
                  you keep this option enabled.
                </Typography>
              )
            }
          />
        </Paper>
        <ActionsPanel>
          <Button
            disabled={
              !this.state.selectedId ||
              linodeInTransition(this.props.linodeStatus || '') ||
              disabled
            }
            loading={this.state.isLoading}
            buttonType="primary"
            onClick={this.onSubmit}
            data-qa-submit
          >
            Submit
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

interface WithTypesProps {
  currentTypesData: ExtendedType[];
  deprecatedTypesData: ExtendedType[];
}

const withTypes = connect((state: ApplicationState, ownProps) => ({
  currentTypesData: state.__resources.types.entities
    .filter(eachType => eachType.successor === null)
    .map(LinodeResize.extendType),

  deprecatedTypesData: state.__resources.types.entities
    .filter(eachType => eachType.successor !== null)
    .map(LinodeResize.extendType)
}));

interface DispatchProps {
  updateLinode: (id: number) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    updateLinode: (id: number) => dispatch(requestLinodeForStore(id))
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

const linodeContext = withLinodeDetailContext(state => {
  const { linode } = state;
  return {
    linodeId: linode.id,
    linodeType: linode.type,
    linodeStatus: linode.status,
    linodeLabel: linode.label,
    permissions: linode._permissions,
    linodeDisks: linode._disks
  };
});

/**
 * the user should only be given the option to automatically resize
 * their disks under the 2 following conditions:
 *
 * 1. They have 1 ext disk (and nothing else)
 * 2. They have 1 ext disk and 1 swap disk (and nothing else)
 *
 * If they have more than 2 disks, no automatic resizing is going to
 * take place server-side, so given them the option to toggle
 * the checkbox is pointless.
 *
 * @returns array of both the ext disk to resize and a boolean
 * of whether the option should be enabled
 */
export const shouldEnableAutoResizeDiskOption = (
  linodeDisks: Disk[]
): [string | undefined, boolean] => {
  const linodeExtDiskLabels = linodeDisks.reduce((acc, eachDisk) => {
    return eachDisk.filesystem === 'ext3' || eachDisk.filesystem === 'ext4'
      ? [...acc, eachDisk.label]
      : acc;
  }, []);
  const linodeHasOneExtDisk = linodeExtDiskLabels.length === 1;
  const linodeHasOneSwapDisk =
    linodeDisks.reduce((acc, eachDisk) => {
      return eachDisk.filesystem === 'swap'
        ? [...acc, eachDisk.filesystem]
        : acc;
    }, []).length === 1;
  const shouldEnable =
    (linodeDisks.length === 1 && linodeHasOneExtDisk) ||
    (linodeDisks.length === 2 && linodeHasOneSwapDisk && linodeHasOneExtDisk);
  return [linodeExtDiskLabels[0], shouldEnable];
};

export const isSmallerThanCurrentPlan = (
  selectedPlanID: string,
  currentPlanID: string,
  types: ExtendedType[]
) => {
  const currentType = types.find(thisType => thisType.id === currentPlanID);
  const nextType = types.find(thisType => thisType.id === selectedPlanID);

  if (!(currentType && nextType)) {
    return false;
  }

  return currentType.disk > nextType.disk;
};

export default compose<CombinedProps, {}>(
  linodeContext,
  withTypes,
  styled,
  withSnackbar,
  withRouter,
  connected
)(LinodeResize);
