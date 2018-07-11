import { compose, equals, pathOr } from 'ramda';
import * as React from 'react';
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

type CombinedProps = Props & WithStyles<ClassNames>;

export const modes = {
  CLOSED: 'closed',
  CREATING: 'create',
  RESTORING: 'restore',
  DEPLOYING: 'deploy',
  EDITING: 'edit',
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create an Image',
  [modes.RESTORING]: 'Restore from an Image',
  [modes.DEPLOYING]: 'Deploy a New Linode',
  [modes.EDITING]: 'Edit an Image',
};

class ImageDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  eventsSub: Subscription;
  state = {
    disks: [],
    linodes: [],
    errors: undefined,
    notice: undefined,
  };

  componentDidMount() {
    this.mounted = true;
    this.updateLinodes();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (this.props.selectedLinode && this.props.selectedLinode !== prevProps.selectedLinode) {
      getLinodeDisks(Number(this.props.selectedLinode))
      .then((response) => {
        const filteredDisks = response.data.filter((disk) => disk.filesystem !== 'swap')
        if (!equals(this.state.disks, filteredDisks)) {
          this.setState({ disks: filteredDisks })
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


  close = () => {
    this.setState({ errors: undefined, notice: undefined, });
    this.props.onClose();
  }


  onSubmit = () => {
    const { mode, imageID, onSuccess, label, description, selectedDisk } = this.props;
    const safeDescription = description ? description : ' ';

    if (!label) {
      this.setState({
        errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
      });
      return;
    }

    switch (mode) {
      case modes.EDITING:
      if (!imageID) {
        return;
      }

      updateImage(imageID, label, safeDescription)
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
      createImage(Number(selectedDisk), label, safeDescription)
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
      default:
      return;
    }
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

  render() {
    const { label,
            description,
            selectedDisk,
            selectedLinode,
            mode,
            changeDisk,
            changeLinode,
            changeLabel,
            changeDescription, } = this.props;
    const { disks, linodes, notice,} = this.state;
    const { errors } = this.state;
    // When creating an image, disable the submit button until a Linode,
    // disk, and label are selected. When editing, only a label is required.
    const requirementsMet = (mode === 'create')
                            ? !(selectedDisk && selectedLinode && label)
                            : !label;

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

        {mode === 'create' &&
        <LinodeSelect
          linodes={linodes}
          selectedLinode={selectedLinode || 'none'}
          linodeError={linodeError}
          handleChange={changeLinode}
        />
        }

        {mode === 'create' &&
        <DiskSelect
          selectedDisk={selectedDisk || 'none'}
          disks={disks}
          diskError={diskError}
          handleChange={changeDisk}
        />
       }

        <TextField
          label="Label"
          required
          value={label}
          onChange={changeLabel}
          error={Boolean(labelError)}
          errorText={labelError}
          data-qa-volume-label
        />

        <TextField
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={changeDescription}
          error={Boolean(descriptionError)}
          errorText={descriptionError}
          data-qa-size
        />

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

export default compose<any, any, any>(
  styled,
  SectionErrorBoundary,
)(ImageDrawer);
