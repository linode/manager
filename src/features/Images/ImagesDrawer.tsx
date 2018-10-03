import { compose, equals, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import { resetEventsPolling } from 'src/events';
import DiskSelect from 'src/features/linodes/DiskSelect';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { createImage, updateImage } from 'src/services/images';
import { getLinodeDisks, getLinodes } from 'src/services/linodes';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root'
|  'suffix'
|  'actionPanel';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  suffix: {
    fontSize: '.9rem',
    marginRight: theme.spacing.unit,
  },
  actionPanel: {
    marginTop: theme.spacing.unit * 2,
  },
});

export interface Props {
  mode: string;
  open: boolean;
  description?: string;
  imageID?: string;
  label?: string;
  disks?: Linode.Disk[];
  selectedDisk?: string;
  selectedLinode?: string;
  onClose: () => void;
  onSuccess: () => void;
  changeLinode: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDisk: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeDescription: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface State {
  disks: Linode.Disk[];
  linodes: string[][];
  notice?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

export const modes = {
  CLOSED: 'closed',
  CREATING: 'create',
  IMAGIZING: 'imagize',
  RESTORING: 'restore',
  EDITING: 'edit',
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create an Image',
  [modes.RESTORING]: 'Restore from an Image',
  [modes.EDITING]: 'Edit an Image',
  [modes.IMAGIZING]: 'Create an Image',
};

class ImageDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  state = {
    disks: [],
    linodes: [],
    errors: undefined,
    notice: undefined,
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
    /** Is opening... */
    if(prevProps.open === false && this.props.open === true){
      this.updateLinodes();
    }

    if (this.props.disks && !equals(this.props.disks, prevProps.disks)) {
      // for the 'imagizing' mode
      this.setState({ disks: this.props.disks });
    }

    if (this.props.selectedLinode && this.props.selectedLinode !== prevProps.selectedLinode) {
      getLinodeDisks(Number(this.props.selectedLinode))
        .then((response) => {
          if(!this.mounted){ return; }

          const filteredDisks = response.data.filter((disk) => disk.filesystem !== 'swap')
          if (!equals(this.state.disks, filteredDisks)) {
            this.setState({ disks: filteredDisks })
          }
        })
        .catch((error) => {
          if(!this.mounted){ return; }

          if (this.mounted) {
            this.setState({
            errors: [{ field: 'disk', reason: 'Could not retrieve disks for this Linode.' }],
          });
        }
     });
    }
  }

  close = () => {
    this.props.onClose();
    this.setState({ errors: undefined, notice: undefined, });
  }

  onSubmit = () => {
    const { mode, imageID, onSuccess, label, description, history, selectedDisk, selectedLinode } = this.props;
    const safeDescription = description ? description : ' ';
    const errors = [];

    switch (mode) {
      case modes.EDITING:
        if (!imageID) {
          return;
        }

        if (!label) {
          this.setState({
            errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
          });
          return;
        }

        updateImage(imageID, label, safeDescription)
          .then(() => {
            if(!this.mounted){ return; }

            onSuccess();
            this.close();
          })
          .catch((errorResponse) => {
            if(!this.mounted){ return; }

            this.setState({
              errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
            });
          });
        return;

      case modes.CREATING:
      case modes.IMAGIZING:
        if (!selectedDisk) { errors.push({ field: 'disk_id', reason: 'Choose a disk.' }); }
        if (!label)   { errors.push({ field: 'label', reason: 'Label cannot be blank.' }); }
        if (errors.length > 0) {
          this.setState({ errors })
          return;
        };

        // If no label it will return after error checking above, so we can be confident
        // the value is declared here.
        createImage(Number(selectedDisk), label!, safeDescription)
          .then((response) => {
            if(!this.mounted){ return; }

            resetEventsPolling();
            this.setState({
              notice: "Image scheduled for creation.",
            });
            setTimeout(this.close, 4000);
          })
          .catch((errorResponse) => {
            if(!this.mounted){ return; }

            this.setState({
              errors: pathOr(
                'There was an error creating the image.',
                ['response', 'data', 'errors'],
                errorResponse
              ),
            });
          })
        return;

      case modes.RESTORING:
        if (!selectedLinode) {
          this.setState({
            errors: [{ field: 'linode_id', reason: 'Choose a Linode.' }],
          });
          return;
        }
        this.close();
        history.push({
          pathname: `/linodes/${selectedLinode}/rebuild`,
          state: { selectedImageId: imageID },
        })
      default:
        return;
    }
  }

  updateLinodes() {
    getLinodes({ page: 1 })
      .then((response) => {
        if(!this.mounted){ return; }

        const linodeChoices = response.data.map((linode) => {
          return [`${linode.id}`, linode.label];
        });
        this.setState({ linodes: linodeChoices });
      });
  }

  checkRequirements = () => {
    // When creating an image, disable the submit button until a Linode,
    // disk, and label are selected. When editing, only a label is required.
    // When restoring to an existing Linode, the Linode select is the only field.
    const { mode, label, selectedDisk, selectedLinode} = this.props;
    switch(mode) {
      case modes.CREATING:
        return !(selectedDisk && selectedLinode && label);
      case modes.IMAGIZING:
        return !(selectedDisk && label);
      case modes.EDITING:
        return !label;
      case modes.RESTORING:
        return !selectedLinode;
      default:
        return false;
    }
  }

  render() {
    const { label,
      description,
      selectedDisk,
      selectedLinode,
      mode,
      changeDisk,
      changeLinode,
      changeLabel,
      changeDescription,
    } = this.props;
    const { disks, linodes, notice,} = this.state;
    const { errors } = this.state;

    const requirementsMet = this.checkRequirements();

    const hasErrorFor = getAPIErrorFor({
      linode_id: 'Linode',
      config_id: 'Config',
      region: 'Region',
      size: 'Size',
      label: 'Label',
    }, errors);
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
        {generalError &&
          <Notice
            error
            text={generalError}
            data-qa-notice
          />
        }

        {notice &&
          <Notice
            success
            text={notice}
            data-qa-notice
          />
        }

        {[modes.CREATING, modes.RESTORING].includes(mode) &&
          <LinodeSelect
            linodes={linodes}
            selectedLinode={selectedLinode || 'none'}
            linodeError={linodeError}
            handleChange={changeLinode}
            updateFor={[linodes, selectedLinode, linodeError]}
          />
        }

        {[modes.CREATING, modes.IMAGIZING].includes(mode) &&
          <DiskSelect
            selectedDisk={selectedDisk || 'none'}
            disks={disks}
            diskError={diskError}
            handleChange={changeDisk}
            updateFor={[disks, selectedDisk, diskError]}
            disabled={mode === modes.IMAGIZING}
            data-qa-disk-select
          />
        }

        {[modes.CREATING, modes.EDITING, modes.IMAGIZING].includes(mode) &&
          <React.Fragment>
            <TextField
              label="Label"
              required
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
        }

        <ActionsPanel style={{ marginTop: 16 }} updateFor={[requirementsMet]}>
          <Button
            onClick={this.onSubmit}
            disabled={requirementsMet}
            variant="raised"
            color="primary"
            data-qa-submit
          >
            Create
          </Button>
          <Button
            onClick={this.close}
            variant="raised"
            color="secondary"
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

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any, any>(
  styled,
  withRouter,
  SectionErrorBoundary,
)(ImageDrawer);
