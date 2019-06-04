import { WithStyles } from '@material-ui/core/styles';
import { compose, equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import { resetEventsPolling } from 'src/events';
import DiskSelect from 'src/features/linodes/DiskSelect';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { createImage, updateImage } from 'src/services/images';
import { getLinodeDisks } from 'src/services/linodes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root' | 'suffix' | 'actionPanel' | 'helperText';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    suffix: {
      fontSize: '.9rem',
      marginRight: theme.spacing(1)
    },
    actionPanel: {
      marginTop: theme.spacing(2)
    },
    helperText: {
      paddingTop: theme.spacing(1) / 2
    }
  });

export interface Props {
  mode: string;
  open: boolean;
  description?: string;
  imageID?: string;
  label?: string;
  // Only used from LinodeDisks to pre-populate the selected Disk
  disks?: Linode.Disk[];
  selectedDisk: string | null;
  onClose: () => void;
  changeDisk: (disk: string | null) => void;
  selectedLinode: number | null;
  onSuccess: () => void;
  changeLinode: (linodeId: number) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface State {
  disks: Linode.Disk[];
  notice?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

export const modes = {
  CLOSED: 'closed',
  CREATING: 'create',
  IMAGIZING: 'imagize',
  RESTORING: 'restore',
  EDITING: 'edit'
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create an Image',
  [modes.RESTORING]: 'Restore from an Image',
  [modes.EDITING]: 'Edit an Image',
  [modes.IMAGIZING]: 'Create an Image'
};

class ImageDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state = {
    disks: [],
    errors: undefined,
    notice: undefined
  };

  componentDidMount() {
    this.mounted = true;

    if (this.props.disks) {
      // for the 'imagizing' mode
      this.setState({ disks: this.props.disks });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (this.props.disks && !equals(this.props.disks, prevProps.disks)) {
      // for the 'imagizing' mode
      this.setState({ disks: this.props.disks });
    }

    if (!this.props.selectedLinode && prevProps.selectedLinode) {
      this.setState({ disks: [] });
    }

    if (
      this.props.selectedLinode &&
      this.props.selectedLinode !== prevProps.selectedLinode
    ) {
      getLinodeDisks(this.props.selectedLinode)
        .then(response => {
          if (!this.mounted) {
            return;
          }

          const filteredDisks = response.data.filter(
            disk => disk.filesystem !== 'swap'
          );
          if (!equals(this.state.disks, filteredDisks)) {
            this.setState({ disks: filteredDisks });
          }
        })
        .catch(_ => {
          if (!this.mounted) {
            return;
          }

          if (this.mounted) {
            this.setState({
              errors: [
                {
                  field: 'disk_id',
                  reason: 'Could not retrieve disks for this Linode.'
                }
              ]
            });
          }
        });
    }
  }

  close = () => {
    this.props.onClose();
    this.setState({ errors: undefined, notice: undefined });
  };

  onSubmit = () => {
    const {
      mode,
      imageID,
      onSuccess,
      label,
      description,
      history,
      selectedDisk,
      selectedLinode
    } = this.props;

    this.setState({ errors: undefined, notice: undefined });
    const safeDescription = description ? description : ' ';

    switch (mode) {
      case modes.EDITING:
        if (!imageID) {
          return;
        }

        updateImage(imageID, label, safeDescription)
          .then(() => {
            if (!this.mounted) {
              return;
            }

            onSuccess();
            this.close();
          })
          .catch(errorResponse => {
            if (!this.mounted) {
              return;
            }

            this.setState({
              errors: getAPIErrorOrDefault(
                errorResponse,
                'Unable to edit image'
              )
            });
          });
        return;

      case modes.CREATING:
      case modes.IMAGIZING:
        createImage(Number(selectedDisk), label, safeDescription)
          .then(_ => {
            if (!this.mounted) {
              return;
            }

            resetEventsPolling();
            this.setState({
              notice: 'Image scheduled for creation.'
            });
            setTimeout(this.close, 4000);
          })
          .catch(errorResponse => {
            if (!this.mounted) {
              return;
            }

            this.setState({
              errors: getAPIErrorOrDefault(
                errorResponse,
                'There was an error creating the image.'
              )
            });
          });
        return;

      case modes.RESTORING:
        if (!selectedLinode) {
          this.setState({
            errors: [{ field: 'linode_id', reason: 'Choose a Linode.' }]
          });
          return;
        }
        this.close();
        history.push({
          pathname: `/linodes/${selectedLinode}/rebuild`,
          state: { selectedImageId: imageID }
        });
      default:
        return;
    }
  };

  checkRequirements = () => {
    // When creating an image, disable the submit button until a Linode,
    // disk, and label are selected. When editing, only a label is required.
    // When restoring to an existing Linode, the Linode select is the only field.
    const { mode, selectedDisk, selectedLinode } = this.props;

    const isDiskSelected = Boolean(selectedDisk);

    switch (mode) {
      case modes.CREATING:
        return !(isDiskSelected && selectedLinode);
      case modes.IMAGIZING:
        return !isDiskSelected;
      case modes.RESTORING:
        return !selectedLinode;
      default:
        return false;
    }
  };

  render() {
    const {
      label,
      description,
      selectedDisk,
      selectedLinode,
      mode,
      changeDisk,
      changeLinode,
      changeLabel,
      changeDescription,
      classes
    } = this.props;
    const { disks, notice } = this.state;
    const { errors } = this.state;

    const requirementsMet = this.checkRequirements();

    const hasErrorFor = getAPIErrorFor(
      {
        linode_id: 'Linode',
        disk_id: 'Disk',
        region: 'Region',
        size: 'Size',
        label: 'Label'
      },
      errors
    );
    const labelError = hasErrorFor('label');
    const descriptionError = hasErrorFor('description');
    const generalError = hasErrorFor('none');
    const linodeError = hasErrorFor('linode_id');
    const diskError = hasErrorFor('disk_id');

    return (
      <Drawer
        open={this.props.open}
        onClose={this.props.onClose}
        title={titleMap[mode]}
      >
        {generalError && <Notice error text={generalError} data-qa-notice />}

        {notice && <Notice success text={notice} data-qa-notice />}

        {[modes.CREATING, modes.RESTORING].includes(mode) && (
          <LinodeSelect
            selectedLinode={selectedLinode}
            linodeError={linodeError}
            handleChange={linode => changeLinode(linode.id)}
            updateFor={[selectedLinode, linodeError, classes]}
          />
        )}

        {[modes.CREATING, modes.IMAGIZING].includes(mode) && (
          <>
            <DiskSelect
              selectedDisk={selectedDisk}
              disks={disks}
              diskError={diskError}
              handleChange={changeDisk}
              updateFor={[disks, selectedDisk, diskError, classes]}
              disabled={mode === modes.IMAGIZING}
              data-qa-disk-select
            />
            <Typography className={classes.helperText} variant="body1">
              Images must be less than 2048MB each.
            </Typography>
          </>
        )}

        {[modes.CREATING, modes.EDITING, modes.IMAGIZING].includes(mode) && (
          <React.Fragment>
            <TextField
              label="Label"
              value={label}
              onChange={changeLabel}
              error={Boolean(labelError)}
              errorText={labelError}
              data-qa-image-label
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              value={description}
              onChange={changeDescription}
              error={Boolean(descriptionError)}
              errorText={descriptionError}
              data-qa-image-description
            />
          </React.Fragment>
        )}

        <ActionsPanel
          style={{ marginTop: 16 }}
          updateFor={[requirementsMet, classes]}
        >
          <Button
            onClick={this.onSubmit}
            disabled={requirementsMet}
            buttonType="primary"
            data-qa-submit
          >
            {mode === modes.EDITING ? 'Update' : 'Create'}
          </Button>
          <Button
            onClick={this.close}
            buttonType="secondary"
            className="cancel"
            data-qa-cancel
          >
            Cancel
          </Button>
        </ActionsPanel>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

export default compose<any, any, any, any>(
  styled,
  withRouter,
  SectionErrorBoundary
)(ImageDrawer);
