import { Disk, getLinodeDisks } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import { IMAGE_DEFAULT_LIMIT } from 'src/constants';
import withImages, {
  ImagesDispatch
} from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/eventsPolling';
import DiskSelect from 'src/features/linodes/DiskSelect';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
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
  mode: DrawerMode;
  open: boolean;
  description?: string;
  imageID?: string;
  label?: string;
  // Only used from LinodeDisks to pre-populate the selected Disk
  disks?: Disk[];
  selectedDisk: string | null;
  onClose: () => void;
  changeDisk: (disk: string | null) => void;
  selectedLinode: number | null;
  changeLinode: (linodeId: number) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface State {
  disks: Disk[];
  notice?: string;
  errors?: APIError[];
  submitting: boolean;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  ImagesDispatch;

export type DrawerMode = 'closed' | 'create' | 'imagize' | 'restore' | 'edit';

const titleMap: Record<DrawerMode, string> = {
  closed: '',
  create: 'Create an Image',
  imagize: 'Create an Image',
  edit: 'Edit an Image',
  restore: 'Restore from an Image'
};

const buttonTextMap: Record<DrawerMode, string> = {
  closed: '',
  create: 'Create',
  restore: 'Restore',
  edit: 'Update',
  imagize: 'Create'
};

class ImageDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state = {
    disks: [],
    errors: undefined,
    notice: undefined,
    submitting: false
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

  handleLinodeChange = (linodeID: number) => {
    // Clear any errors
    this.setState({ errors: undefined });
    this.props.changeLinode(linodeID);
  };

  handleDiskChange = (diskID: string | null) => {
    // Clear any errors
    this.setState({ errors: undefined });
    this.props.changeDisk(diskID);
  };

  close = () => {
    this.props.onClose();
    if (this.mounted) {
      this.setState({
        errors: undefined,
        notice: undefined,
        submitting: false
      });
    }
  };

  onSubmit = () => {
    const {
      mode,
      imageID,
      label,
      description,
      history,
      selectedDisk,
      selectedLinode,
      updateImage,
      createImage
    } = this.props;

    this.setState({ errors: undefined, notice: undefined, submitting: true });
    const safeDescription = description ? description : ' ';
    switch (mode) {
      case 'edit':
        if (!imageID) {
          this.setState({ submitting: false });
          return;
        }

        updateImage({ imageID, label, description: safeDescription })
          .then(() => {
            if (!this.mounted) {
              return;
            }

            this.close();
          })
          .catch(errorResponse => {
            if (!this.mounted) {
              return;
            }

            this.setState({
              submitting: false,
              errors: getAPIErrorOrDefault(
                errorResponse,
                'Unable to edit Image'
              )
            });
          });
        return;

      case 'create':
      case 'imagize':
        createImage({
          diskID: Number(selectedDisk),
          label,
          description: safeDescription
        })
          .then(_ => {
            if (!this.mounted) {
              return;
            }

            resetEventsPolling();
            this.setState({
              submitting: false,
              notice: 'Image scheduled for creation.'
            });
            setTimeout(this.close, 4000);
          })
          .catch(errorResponse => {
            if (!this.mounted) {
              return;
            }

            this.setState({
              submitting: false,
              errors: getAPIErrorOrDefault(
                errorResponse,
                'There was an error creating the image.'
              )
            });
          });
        return;

      case 'restore':
        if (!selectedLinode) {
          this.setState({
            submitting: false,
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
    // When creating an image, disable the submit button until a Linode and
    // disk are selected. When restoring to an existing Linode, the Linode select is the only field.
    // When imagizing, the Linode is selected already so only check for a disk selection.
    const { mode, selectedDisk, selectedLinode } = this.props;

    const isDiskSelected = Boolean(selectedDisk);

    switch (mode) {
      case 'create':
        return !(isDiskSelected && selectedLinode);
      case 'imagize':
        return !isDiskSelected;
      case 'restore':
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
      changeLabel,
      changeDescription,
      classes
    } = this.props;
    const { disks, errors, notice, submitting } = this.state;

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

        {['create', 'restore'].includes(mode) && (
          <LinodeSelect
            selectedLinode={selectedLinode}
            linodeError={linodeError}
            handleChange={linode => this.handleLinodeChange(linode.id)}
            updateFor={[selectedLinode, linodeError, classes]}
          />
        )}

        {['create', 'imagize'].includes(mode) && (
          <>
            <DiskSelect
              selectedDisk={selectedDisk}
              disks={disks}
              diskError={diskError}
              handleChange={this.handleDiskChange}
              updateFor={[disks, selectedDisk, diskError, classes]}
              disabled={mode === 'imagize'}
              data-qa-disk-select
            />
            <Typography className={classes.helperText} variant="body1">
              Linode Images are limited to {IMAGE_DEFAULT_LIMIT}MB of data per
              disk by default. Please ensure that your disk content does not
              exceed this size limit, or open a Support ticket to request a
              higher limit. Additionally, Linode Images cannot be created if you
              are using raw disks or disks that have been formatted using custom
              filesystems.
            </Typography>
          </>
        )}

        {['create', 'edit', 'imagizing'].includes(mode) && (
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
          updateFor={[requirementsMet, classes, submitting, mode]}
        >
          <Button
            onClick={this.onSubmit}
            disabled={requirementsMet}
            loading={submitting}
            buttonType="primary"
            data-qa-submit
          >
            {buttonTextMap[mode] ?? 'Submit'}
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

export default compose<CombinedProps, Props>(
  styled,
  withRouter,
  withImages(),
  SectionErrorBoundary
)(ImageDrawer);
