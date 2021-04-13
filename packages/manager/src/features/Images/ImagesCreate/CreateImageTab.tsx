import { Disk, getLinodeDisks } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import { IMAGE_DEFAULT_LIMIT } from 'src/constants';
import withProfile from 'src/containers/profile.container';
import withImages, {
  ImagesDispatch,
} from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/eventsPolling';
import DiskSelect from 'src/features/linodes/DiskSelect';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root' | 'helperText' | 'container';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    helperText: {
      paddingTop: theme.spacing(1) / 2,
    },
    container: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(4),
      '& .MuiFormHelperText-root': {
        marginBottom: theme.spacing(2),
      },
    },
  });

interface State {
  description: string;
  imageID: string;
  label: string;
  selectedLinode: number;
  selectedDisk: string | null;
  disks: Disk[];
  notice?: string;
  errors?: APIError[];
  submitting: boolean;
}

type CombinedProps = WithStyles<ClassNames> &
  RouteComponentProps<{}> &
  WithSnackbarProps &
  ProfileProps &
  ImagesDispatch;

class CreateImageTab extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state = {
    description: '',
    imageID: '',
    label: '',
    selectedLinode: 0,
    selectedDisk: '',
    disks: [],
    errors: undefined,
    notice: undefined,
    submitting: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchLinodeDisksOnLinodeChange = (selectedLinode: number) => {
    this.setState({
      selectedDisk: '',
    });

    getLinodeDisks(selectedLinode)
      .then((response) => {
        if (!this.mounted) {
          return;
        }

        const filteredDisks = response.data.filter(
          (disk) => disk.filesystem !== 'swap'
        );
        if (!equals(this.state.disks, filteredDisks)) {
          this.setState({ disks: filteredDisks });
        }
      })
      .catch((_) => {
        if (!this.mounted) {
          return;
        }

        if (this.mounted) {
          this.setState({
            errors: [
              {
                field: 'disk_id',
                reason: 'Could not retrieve disks for this Linode.',
              },
            ],
          });
        }
      });
  };

  changeSelectedLinode = (linodeId: number | null) => {
    const linodeID = linodeId ?? 0;
    this.fetchLinodeDisksOnLinodeChange(linodeID);
    this.setState({
      selectedLinode: linodeID,
    });
  };

  handleLinodeChange = (linodeID: number) => {
    // Clear any errors
    this.setState({ errors: undefined });
    this.changeSelectedLinode(linodeID);
  };

  changeSelectedDisk = (disk: string | null) => {
    this.setState({
      selectedDisk: disk,
    });
  };

  handleDiskChange = (diskID: string | null) => {
    // Clear any errors
    this.setState({ errors: undefined });
    this.changeSelectedDisk(diskID);
  };

  setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    this.setState({
      label: value,
    });
  };

  setDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({
      description: value,
    });
  };

  onSubmit = () => {
    const { history, createImage, enqueueSnackbar } = this.props;

    const { label, description, selectedDisk } = this.state;

    this.setState({ errors: undefined, notice: undefined, submitting: true });
    const safeDescription = description ?? '';

    createImage({
      diskID: Number(selectedDisk),
      label,
      description: safeDescription,
    })
      .then((_) => {
        if (!this.mounted) {
          return;
        }

        resetEventsPolling();

        this.setState({
          submitting: false,
        });

        enqueueSnackbar('Image scheduled for creation.', {
          variant: 'info',
        });

        history.push('/images');
      })
      .catch((errorResponse) => {
        if (!this.mounted) {
          return;
        }

        this.setState({
          submitting: false,
          errors: getAPIErrorOrDefault(
            errorResponse,
            'There was an error creating the image.'
          ),
        });
      });
  };

  checkRequirements = () => {
    // When creating an image, disable the submit button until a Linode and
    // disk are selected.
    const { selectedDisk, selectedLinode } = this.state;

    const isDiskSelected = Boolean(selectedDisk);

    return !(isDiskSelected && selectedLinode);
  };

  render() {
    const { availableImages, canCreateImage, classes } = this.props;
    const {
      disks,
      errors,
      notice,
      submitting,
      label,
      description,
      selectedLinode,
      selectedDisk,
    } = this.state;

    const requirementsMet = this.checkRequirements();

    const hasErrorFor = getAPIErrorFor(
      {
        linode_id: 'Linode',
        disk_id: 'Disk',
        region: 'Region',
        size: 'Size',
        label: 'Label',
      },
      errors
    );
    const labelError = hasErrorFor('label');
    const descriptionError = hasErrorFor('description');
    const generalError = hasErrorFor('none');
    const linodeError = hasErrorFor('linode_id');
    const diskError = hasErrorFor('disk_id');

    return (
      <Paper className={classes.container}>
        {!canCreateImage ? (
          <Notice
            error
            text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          />
        ) : null}
        {generalError && <Notice error text={generalError} data-qa-notice />}

        {notice && <Notice success text={notice} data-qa-notice />}

        <LinodeSelect
          selectedLinode={selectedLinode}
          linodeError={linodeError}
          disabled={!canCreateImage}
          handleChange={(linode) => this.handleLinodeChange(linode.id)}
          filterCondition={(linode) =>
            availableImages ? availableImages.includes(linode.id) : true
          }
          updateFor={[
            selectedLinode,
            linodeError,
            classes,
            canCreateImage,
            availableImages,
          ]}
        />

        <>
          <DiskSelect
            selectedDisk={selectedDisk}
            disks={disks}
            diskError={diskError}
            handleChange={this.handleDiskChange}
            updateFor={[disks, selectedDisk, diskError, classes]}
            disabled={!canCreateImage}
            data-qa-disk-select
          />
          <Typography className={classes.helperText} variant="body1">
            Linode Images are limited to {IMAGE_DEFAULT_LIMIT}MB of data per
            disk by default. Please ensure that your disk content does not
            exceed this size limit, or open a Support ticket to request a higher
            limit. Additionally, Linode Images cannot be created if you are
            using raw disks or disks that have been formatted using custom
            filesystems.
          </Typography>
        </>

        <>
          <TextField
            label="Label"
            value={label}
            onChange={this.setLabel}
            error={Boolean(labelError)}
            errorText={labelError}
            disabled={!canCreateImage}
            data-qa-image-label
          />

          <TextField
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={this.setDescription}
            error={Boolean(descriptionError)}
            errorText={descriptionError}
            disabled={!canCreateImage}
            data-qa-image-description
          />
        </>

        <ActionsPanel
          style={{ marginTop: 16 }}
          updateFor={[requirementsMet, classes, submitting]}
        >
          <Button
            onClick={this.onSubmit}
            disabled={requirementsMet || !canCreateImage}
            loading={submitting}
            buttonType="primary"
            data-qa-submit
          >
            Create Image
          </Button>
        </ActionsPanel>
      </Paper>
    );
  }
}

const styled = withStyles(styles);

interface ProfileProps {
  canCreateImage: boolean;
  availableImages: number[] | null;
}

export default compose<CombinedProps, {}>(
  styled,
  withRouter,
  withImages(),
  withSnackbar,
  SectionErrorBoundary,
  withProfile<ProfileProps, {}>((undefined, { profileData: profile }) => ({
    canCreateImage:
      Boolean(!profile?.restricted) ||
      Boolean(profile?.grants?.global.add_images),
    // Unrestricted users can create Images from any disk;
    // Restricted users need read_write on the Linode they're trying to Imagize
    // (in addition to the global add_images grant).
    availableImages: profile?.restricted
      ? profile?.grants?.linode
          .filter((thisGrant) => thisGrant.permissions === 'read_write')
          .map((thisGrant) => thisGrant.id) ?? []
      : null,
  }))
)(CreateImageTab);
