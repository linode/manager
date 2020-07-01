import { GrantLevel } from '@linode/api-v4/lib/account';
import {
  Disk,
  LinodeStatus,
  LinodeType,
  resizeLinode
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Checkbox from 'src/components/CheckBox';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import ExternalLink from 'src/components/ExternalLink';
import HelpIcon from 'src/components/HelpIcon';
import { resetEventsPolling } from 'src/eventsPolling';
import SelectPlanPanel, {
  ExtendedType
} from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { ApplicationState } from 'src/store';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import HostMaintenanceError from '../HostMaintenanceError';
import LinodePermissionsError from '../LinodePermissionsError';
import ResizeConfirmation from './ResizeConfirmationDialog';

type ClassNames =
  | 'root'
  | 'title'
  | 'subTitle'
  | 'toolTip'
  | 'currentPlanContainer'
  | 'resizeTitle'
  | 'checkbox'
  | 'currentHeaderEmptyCell'
  | 'tabbedPanelInnerClass'
  | 'selectPlanPanel';

const styles = (theme: Theme) =>
  createStyles({
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
    },
    tabbedPanelInnerClass: {
      padding: 0
    },
    selectPlanPanel: {
      marginTop: theme.spacing(5)
    }
  });

interface Props {
  linodeId?: number;
  open: boolean;
  onClose: () => void;
}

interface ConfirmationDialog {
  isOpen: boolean;
  error?: string;
  submitting: boolean;
  currentPlan: string;
  targetPlan: string;
}

interface State {
  selectedId: string;
  errors?: APIError[];
  autoDiskResize: boolean;
  confirmationDialog: ConfirmationDialog;
}

type CombinedProps = Props &
  WithTypesProps &
  RouteComponentProps &
  WithStyles<ClassNames> &
  DispatchProps &
  WithSnackbarProps &
  StateProps;

export class LinodeResize extends React.Component<CombinedProps, State> {
  state: State = {
    selectedId: '',
    autoDiskResize: false,
    confirmationDialog: {
      isOpen: false,
      submitting: false,
      currentPlan: '',
      targetPlan: ''
    }
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

  openConfirmationModal = () => {
    const { linodeType, currentTypesData } = this.props;
    const { selectedId } = this.state;
    const _current = getLinodeType(currentTypesData, linodeType || 'none');
    const _target = getLinodeType(currentTypesData, selectedId);
    const currentPlan = _current ? _current.label : 'Unknown plan';
    const targetPlan = _target ? _target.label : 'Unknown plan';
    this.setState({
      confirmationDialog: {
        ...this.state.confirmationDialog,
        isOpen: true,
        error: undefined,
        currentPlan,
        targetPlan
      }
    });
  };

  closeConfirmationModal = () => {
    this.setState({
      confirmationDialog: {
        ...this.state.confirmationDialog,
        isOpen: false
      }
    });
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

    this.setState({
      confirmationDialog: { ...this.state.confirmationDialog, submitting: true }
    });

    /**
     * Only set the allow_auto_disk_resize flag to true if both the user
     * has selected it (this.state.autoDiskResize) and
     * the flag would be honored (so disable if the current plan
     * is larger than the target plan).
     */
    resizeLinode(linodeId, selectedId, this.state.autoDiskResize && !isSmaller)
      .then(_ => {
        this.setState({
          selectedId: '',
          confirmationDialog: {
            ...this.state.confirmationDialog,
            submitting: false
          }
        });
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
        const error = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue resizing your Linode.'
        )[0].reason;
        this.setState({
          confirmationDialog: {
            ...this.state.confirmationDialog,
            error,
            submitting: false
          }
        });
      });
  };

  handleSelectPlan = (id: string) => {
    this.setState({ selectedId: id });
  };

  handleToggleAutoDisksResize = () => {
    this.setState({ autoDiskResize: !this.state.autoDiskResize });
  };

  componentDidUpdate = (prevProps: CombinedProps) => {
    if (
      prevProps.linodeId !== this.props.linodeId &&
      !!this.props.linodeId &&
      this.props.linodeDisks?.length === 0
    ) {
      // @todo: Error?
      this.props.getLinodeDisks(this.props.linodeId);
    }

    if (
      prevProps.linodeDisks?.length == 0 &&
      this.props.linodeDisks && // TS Compiler wasn't recognizing the optional chaining here.
      this.props.linodeDisks.length > 0
    ) {
      this.setState({
        autoDiskResize: shouldEnableAutoResizeDiskOption(
          this.props.linodeDisks ?? []
        )[1]
      });
    }
  };

  render() {
    const {
      currentTypesData,
      deprecatedTypesData,
      linodeType,
      permissions,
      classes,
      linodeDisks,
      linodeStatus
    } = this.props;
    const type = [...currentTypesData, ...deprecatedTypesData].find(
      t => t.id === linodeType
    );

    const hostMaintenance = linodeStatus === 'stopped';
    const unauthorized = permissions === 'read_only';

    const disabled = hostMaintenance || unauthorized;

    const currentPlanHeading = linodeType
      ? type
        ? type.label
        : 'Unknown Plan'
      : 'No Assigned Plan';

    const [
      diskToResize,
      _shouldEnableAutoResizeDiskOption
    ] = shouldEnableAutoResizeDiskOption(linodeDisks ?? []);

    const isSmaller = isSmallerThanCurrentPlan(
      this.state.selectedId,
      linodeType || '',
      currentTypesData
    );

    return (
      <Dialog
        title="Resize"
        open={this.props.open}
        onClose={this.props.onClose}
        fullWidth
        maxWidth="lg"
      >
        {unauthorized && <LinodePermissionsError />}
        {hostMaintenance && <HostMaintenanceError />}
        <Typography data-qa-description>
          If you&apos;re expecting a temporary burst of traffic to your website,
          or if you&apos;re not using your Linode as much as you thought, you
          can temporarily or permanently resize your Linode to a different plan.{' '}
          <ExternalLink
            fixedIcon
            text="Learn more."
            link="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/"
          />
        </Typography>

        <div className={classes.selectPlanPanel}>
          <SelectPlanPanel
            currentPlanHeading={currentPlanHeading}
            types={this.props.currentTypesData}
            onSelect={this.handleSelectPlan}
            selectedID={this.state.selectedId}
            disabled={disabled}
            updateFor={[this.state.selectedId]}
            tabbedPanelInnerClass={classes.tabbedPanelInnerClass}
          />
        </div>
        <Paper className={classes.checkbox}>
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
              <Typography>
                Would you like{' '}
                {_shouldEnableAutoResizeDiskOption ? (
                  <strong>{diskToResize}</strong>
                ) : (
                  'your disk'
                )}{' '}
                to be automatically scaled with this Linode&apos;s new size? We
                recommend you keep this option enabled when available. Automatic
                resizing is only available when moving to a larger plan, and
                when you have a single ext disk (or one ext and one swap disk)
                on your Linode.
              </Typography>
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
            buttonType="primary"
            onClick={this.openConfirmationModal}
            data-qa-resize
          >
            Resize
          </Button>
        </ActionsPanel>
        <ResizeConfirmation
          {...this.state.confirmationDialog}
          onClose={this.closeConfirmationModal}
          onResize={this.onSubmit}
        />
      </Dialog>
    );
  }
}

const styled = withStyles(styles);

interface WithTypesProps {
  currentTypesData: ExtendedType[];
  deprecatedTypesData: ExtendedType[];
}

const withTypes = connect((state: ApplicationState) => ({
  currentTypesData: state.__resources.types.entities
    .filter(eachType => eachType.successor === null)
    .map(LinodeResize.extendType),

  deprecatedTypesData: state.__resources.types.entities
    .filter(eachType => eachType.successor !== null)
    .map(LinodeResize.extendType)
}));

interface DispatchProps {
  updateLinode: (id: number) => void;
  getLinodeDisks: (linodeId: number) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, Action<any>>
) => {
  return {
    updateLinode: (id: number) => dispatch(requestLinodeForStore(id)),
    getLinodeDisks: (linodeId: number) =>
      dispatch(getAllLinodeDisks({ linodeId }))
  };
};

interface StateProps {
  linodeId?: number;
  linodeType?: null | string;
  linodeStatus?: LinodeStatus;
  linodeLabel?: string;
  permissions?: GrantLevel;
  linodeDisks?: Disk[];
}

const mapStateToProps: MapStateToProps<StateProps, Props> = (
  state: ApplicationState,
  ownProps
) => {
  const { linodeId } = ownProps;

  if (!linodeId) {
    return {};
  }

  const linode = state.__resources.linodes.itemsById[linodeId];
  const linodeDisks = state.__resources.linodeDisks;
  const profile = state.__resources.profile;

  return {
    linodeId: linode.id,
    linodeType: linode.type,
    linodeStatus: linode.status,
    linodeLabel: linode.label,
    permissions: getPermissionsForLinode(profile.data ?? null, linodeId),
    linodeDisks: getLinodeDisksForLinode(linodeDisks, linodeId)
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export const getLinodeType = (types: LinodeType[], selectedTypeID: string) => {
  return types.find(thisType => thisType.id === selectedTypeID);
};

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

export default compose<CombinedProps, Props>(
  withTypes,
  styled,
  withSnackbar,
  withRouter,
  connected
)(LinodeResize);
