import * as React from 'react';

import { compose, equals, path } from 'ramda';
import * as Rx from 'rxjs/Rx';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';

import { events$, resetEventsPolling } from 'src/events';

import { sendToast } from 'src/features/ToastNotifications/toasts';


import { createImage, updateImage } from 'src/services/images';
import { getLinodeDisks, getLinodes } from 'src/services/linodes';


import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import ActionsPanel from 'src/components/ActionsPanel';
import DiskSelect from 'src/components/DiskSelect';
import Drawer from 'src/components/Drawer';
import LinodeSelect from 'src/components/LinodeSelect';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';

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
  eventsSub: Rx.Subscription;
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

    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'disk_imagize',
          'image_delete',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        if (event.action === 'disk_imagize' && (event.status === 'notification' || event.status === 'finished')) {
          sendToast(`Image ${event.entity && event.entity.label} created successfully.`);
        }

        if (event.action === 'disk_imagize' && event.status === 'failed') {
          sendToast(`There was an error creating image ${event.entity && event.entity.label}.`, 'error');
        }
        if (event.action === 'image_delete' && event.status === 'notification') {
          sendToast(`Image ${event.entity && event.entity.label} has been deleted.`);
        }
      });
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
          this.setState({ disks: filteredDisks })
        }
      });
    }
  }

  changeSelectedLinode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedLinode: e.target.value });
  }

  changeSelectedDisk = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ selectedDisk: e.target.value });
  }

  close = () => {
    this.setState({ description: '', label: '', errors: undefined });
    this.props.onClose();
  }

  updateLinodes() {
    /*
     * @todo: We're only getting page 1 here, what if the account has over 100
     * Linodes?
     */
    getLinodes({ page: 1 })
      .then((response) => {
        const linodeChoices = response.data.map((linode) => {
          return [`${linode.id}`, linode.label];
        });
        this.setState({ linodes: linodeChoices });
      });
  }

  onSubmit = () => {
    const { mode, imageID } = this.props;
    const { label, description, selectedDisk } = this.state;

    if (!label) {
      this.setState({
        errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
      }, () => {
        scrollErrorIntoView();
      });
      return;
    }

    switch (mode) {
      case modes.EDITING:
        if (!imageID) {
          return;
        }

        updateImage(imageID, label, description)
          .then(() => {
            resetEventsPolling();
            this.close();
          })
          .catch((errorResponse) => {
            if (this.mounted) {
              this.setState({
                errors: path(['response', 'data', 'errors'], errorResponse),
              }, () => {
                scrollErrorIntoView();
              });
            }
          });
        return;
      case modes.CREATING:
        createImage(Number(selectedDisk), label, description)
          .then((response) => {
            this.setState({
              notice: "Image queued for creation.",
            });
            setTimeout(this.close, 4000);
          })
          .catch((errorResponse) => {
            this.setState({
              errors: path(['response', 'data', 'errors'], errorResponse),
            }, () => {
              scrollErrorIntoView();
            });
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

  render() {
    const { mode, } = this.props;
    const { disks, label, linodes, description, notice, selectedDisk, selectedLinode } = this.state;
    const { errors } = this.state;

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
          selectedLinode={selectedLinode || ''}
          linodeError={linodeError}
          handleChange={this.changeSelectedLinode}
        />
        }

        {mode === 'create' && selectedLinode &&
        <DiskSelect
          selectedDisk={selectedDisk}
          disks={disks}
          diskError={undefined}
          handleChange={this.changeSelectedDisk}
        />
       }

        <TextField
          label="Label"
          required
          value={label}
          onChange={this.setLabel}
          error={Boolean(labelError)}
          errorText={labelError}
          data-qa-volume-label
        />

        <TextField
          label="Description"
          required
          multiline
          value={description}
          onChange={this.setDescription}
          error={Boolean(descriptionError)}
          errorText={descriptionError}
          data-qa-size
        />

        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            onClick={this.onSubmit}
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
