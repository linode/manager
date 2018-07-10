import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { compose, equals, pathOr } from 'ramda';
import { Subscription } from 'rxjs/Rx';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

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

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
  onClose: () => void;
  onSuccess: () => void;
}

interface State {
  label: string;
  description: string;
  disks: Linode.Disk[];
  linodes: string[][];
  notice?: string;
  selectedLinode?: string;
  selectedDisk?: string;
  imageID?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

export const modes = {
  CLOSED: 'closed',
  CREATING: 'create',
  RESTORING: 'restore',
  EDITING: 'edit',
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create an Image',
  [modes.RESTORING]: 'Restore from an Image',
  [modes.EDITING]: 'Edit an Image',
};

class ImageDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  eventsSub: Subscription;
  state = { 
    description: this.props.description ? this.props.description : ' ',
    disks: [],
    label: this.props.label ? this.props.label : '',
    linodes: [],
    errors: undefined,
    notice: undefined,
    selectedDisk: undefined,
    selectedLinode: undefined,
  };

  componentDidMount() {
    this.mounted = true;
    this.updateLinodes();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (this.state.selectedLinode && this.state.selectedLinode !== prevState.selectedLinode) {
      getLinodeDisks(Number(this.state.selectedLinode))
      .then((response) => {
        const filteredDisks = response.data.filter((disk) => disk.filesystem !== 'swap')
        if (!equals(this.state.disks, filteredDisks)) {
          this.setState({ disks: filteredDisks, selectedDisk: undefined })
        }
      })
      .catch((error) => {
        if (this.mounted) { 
          this.setState({ 
          errors: [{ field: 'disk', reason: 'Could not retrieve disks for this Linode.' }], 
        });
      }
     });
    }
  }

  changeSelectedLinode = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ selectedLinode: e.target.value });
  }

  changeSelectedDisk = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ selectedDisk: e.target.value });
  }

  close = () => {
    this.setState({ description: '', label: '', errors: undefined, });
    this.props.onClose();
  }
  
  onSubmit = () => {
    const { mode, history, imageID, onSuccess } = this.props;
    const { label, description, selectedDisk, selectedLinode } = this.state;
    
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
        
        updateImage(imageID, label, description)
        .then(() => {
          onSuccess();
          this.close();
        })
        .catch((errorResponse) => {
          if (this.mounted) {
            this.setState({
              errors: pathOr('Image could not be updated.', ['response', 'data', 'errors'], errorResponse),
            });
          }
        });
        return;
      case modes.CREATING:
        if (!selectedDisk) {
          this.setState({
            errors: [{ field: 'disk_id', reason: 'Choose a disk.' }],
          });
          return;
        }
        else if (!label) {
          this.setState({
            errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
          });
          return;
        }
        createImage(Number(selectedDisk), label, description)
        .then((response) => {
          resetEventsPolling();
          this.setState({
            notice: "Image queued for creation.",
          });
          setTimeout(this.close, 4000);
        })
        .catch((errorResponse) => {
          this.setState({
            errors: pathOr('There was an error creating the image.', ['response', 'data', 'errors'], errorResponse),
          });
        });
      case modes.RESTORING:
        if (!selectedLinode) {
          this.setState({
            errors: [{ field: 'linode_id', reason: 'Choose a Linode.' }],
          });
          return;
        }
        history.push({
          pathname: `/linodes/${selectedLinode}/rebuild`,
          state: { selectedImageId: imageID },
        })
      default:
      return;
    }
  }
  
  setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ label: e.target.value });
  }
  
  setDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: e.target.value });
  }
  
  updateLinodes() {
    getLinodes({ page: 1 })
      .then((response) => {
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
    const { mode, } = this.props;
    const { label, selectedDisk, selectedLinode } = this.state;
    switch(mode) {
      case 'create':
        return !(selectedDisk && selectedLinode && label);
      case 'edit':
        return !label;
      case 'restore':
        return !selectedLinode;
      default:
        return false;
    }
  }

  render() {
    const { mode, } = this.props;
    const { disks, label, linodes, description, notice, selectedDisk, selectedLinode } = this.state;
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

        {['create','restore'].includes(mode) &&
        <LinodeSelect
          linodes={linodes}
          selectedLinode={selectedLinode || 'none'}
          linodeError={linodeError}
          handleChange={this.changeSelectedLinode}
        />
        }

        {mode === 'create' &&
        <DiskSelect
          selectedDisk={selectedDisk || 'none'}
          disks={disks}
          diskError={diskError}
          handleChange={this.changeSelectedDisk}
        />
       }

        {['create','edit'].includes(mode) &&
        <TextField
          label="Label"
          required
          value={label}
          onChange={this.setLabel}
          error={Boolean(labelError)}
          errorText={labelError}
          data-qa-volume-label
        />
        }

        {['create','edit'].includes(mode) &&
        <TextField
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={this.setDescription}
          error={Boolean(descriptionError)}
          errorText={descriptionError}
          data-qa-size
        />
        }

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={this.onSubmit}
            disabled={requirementsMet}
            variant="raised"
            color="primary"
            data-qa-submit
          >
            Submit
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
