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
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { resetEventsPolling } from 'src/eventsPolling';
import SelectPlanPanel from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { linodeInTransition } from 'src/features/linodes/transitions';
import { ApplicationState } from 'src/store';
import { getAllLinodeDisks } from 'src/store/linodes/disk/disk.requests';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { requestLinodeForStore } from 'src/store/linodes/linode.requests';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { EntityError } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { GetAllData } from 'src/utilities/getAll';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import HostMaintenanceError from '../HostMaintenanceError';
import LinodePermissionsError from '../LinodePermissionsError';

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
  linodeLabel?: string;
  open: boolean;
  onClose: () => void;
}

interface State {
  selectedId: string;
  errors?: APIError[];
  autoDiskResize: boolean;
  confirmationText: string;
  submitting: boolean;
  submissionError?: string | JSX.Element;
}

type CombinedProps = Props &
  WithTypesProps &
  WithStyles<ClassNames> &
  DispatchProps &
  WithSnackbarProps &
  StateProps;

export class LinodeResize extends React.Component<CombinedProps, State> {
  state: State = {
    selectedId: '',
    autoDiskResize: false,
    confirmationText: '',
    submitting: false
  };

  onSubmit = () => {
    const {
      linodeId,
      linodeType,
      enqueueSnackbar,
      updateLinode,
      typesData
    } = this.props;
    const { selectedId } = this.state;

    if (!linodeId) {
      return;
    }

    const isSmaller = isSmallerThanCurrentPlan(
      selectedId,
      linodeType || '',
      typesData
    );

    this.setState({
      submitting: true
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
          submitting: false
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

        this.props.onClose();
      })
      .catch(errorResponse => {
        let error: string | JSX.Element = '';
        const reason = errorResponse[0]?.reason ?? '';
        /**
         * The logic below is to manually intercept a certain
         * error and add some JSX with a hyperlink to it.
         *
         * Unfortunately, we have global error interceptors that
         * do the same thing, as is the case when your reputation
         * score is too low to do what you're trying to do.
         *
         * If one of those already-intercepted errors comes through here,
         * it will break the logic (since error[0].reason is not a string).
         */
        if (
          typeof reason === 'string' &&
          reason.match(/allocated more disk/i)
        ) {
          error = (
            <Typography>
              The current disk size of your Linode is too large for the new
              service plan. Please resize your disk to accommodate the new plan.
              You can read our{' '}
              <ExternalLink
                hideIcon
                text="Resize Your Linode"
                link="https://www.linode.com/docs/platform/disk-images/resizing-a-linode/"
              />{' '}
              guide for more detailed instructions.
            </Typography>
          );
        } else {
          error = getAPIErrorOrDefault(
            errorResponse,
            'There was an issue resizing your Linode.'
          )[0].reason;
        }
        this.setState({
          submissionError: error,
          submitting: false
        });
        // Set to "block: end" since the sticky header would otherwise interfere.
        scrollErrorIntoView(undefined, { block: 'end' });
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
      this.props.getLinodeDisks(this.props.linodeId).catch(_ => null);
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
      typesData,
      linodeType,
      permissions,
      classes,
      linodeDisks,
      linodeStatus,
      linodeDisksError,
      linodeLabel
    } = this.props;
    const { confirmationText, submissionError } = this.state;
    const type = typesData.find(t => t.id === linodeType);

    const hostMaintenance = linodeStatus === 'stopped';
    const unauthorized = permissions === 'read_only';
    const disksError = linodeDisksError?.read;

    const tableDisabled =
      hostMaintenance || unauthorized || Boolean(disksError);

    const submitButtonDisabled = confirmationText !== linodeLabel;

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
      typesData
    );

    return (
      <Dialog
        title={
          this.props.linodeLabel ? `Resize ${this.props.linodeLabel}` : 'Resize'
        }
        open={this.props.open}
        onClose={this.props.onClose}
        fullWidth
        fullHeight
        maxWidth="md"
      >
        {unauthorized && <LinodePermissionsError />}
        {hostMaintenance && <HostMaintenanceError />}
        {disksError && (
          <Notice
            error
            text="There was an error loading your Linode's Disks."
          />
        )}
        {submissionError && <Notice error text={submissionError} />}
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
            types={typesData.filter(
              thisType => !thisType.isDeprecated && !thisType.isShadowPlan
            )}
            onSelect={this.handleSelectPlan}
            selectedID={this.state.selectedId}
            disabled={tableDisabled}
            updateFor={[this.state.selectedId]}
            tabbedPanelInnerClass={classes.tabbedPanelInnerClass}
          />
        </div>
        <Paper className={classes.checkbox}>
          <Typography variant="h2" className={classes.resizeTitle}>
            Auto Resize Disk
            {disksError ? (
              <HelpIcon
                className={classes.toolTip}
                text={`There was an error loading your Linode's disks.`}
              />
            ) : isSmaller ? (
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
          <Typography variant="h2">Confirm</Typography>
          <Typography style={{ marginBottom: 8 }}>
            To confirm these changes, type the label of the Linode{' '}
            <strong>({linodeLabel})</strong> in the field below:
          </Typography>
          <TextField
            label="Linode Label"
            hideLabel
            onChange={e => this.setState({ confirmationText: e.target.value })}
            style={{ marginBottom: 16 }}
          />
          <Button
            disabled={
              !this.state.selectedId ||
              linodeInTransition(this.props.linodeStatus || '') ||
              tableDisabled ||
              submitButtonDisabled
            }
            loading={this.state.submitting}
            buttonType="primary"
            onClick={this.onSubmit}
            data-qa-resize
          >
            Resize
          </Button>
        </ActionsPanel>
      </Dialog>
    );
  }
}

const styled = withStyles(styles);

interface DispatchProps {
  updateLinode: (id: number) => void;
  getLinodeDisks: (linodeId: number) => Promise<GetAllData<Disk>>;
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
  linodeDisksError?: EntityError;
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

  if (!linode) {
    return {};
  }

  return {
    linodeId: linode.id,
    linodeType: linode.type,
    linodeStatus: linode.status,
    linodeLabel: linode.label,
    permissions: getPermissionsForLinode(profile.data ?? null, linodeId),
    linodeDisks: getLinodeDisksForLinode(linodeDisks, linodeId),
    linodeDisksError: linodeDisks[linodeId]?.error
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
  connected
)(LinodeResize);
