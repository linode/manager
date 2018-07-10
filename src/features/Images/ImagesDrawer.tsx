import { compose, path } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import TextField from 'src/components/TextField';
import { updateImage } from 'src/services/images';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

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
  label: string;
  description: string;
  imageID: string;
  mode: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setLabel: (e:React.ChangeEvent<HTMLInputElement>) => void;
  setDescription: (e:React.ChangeEvent<HTMLInputElement>) => void;
}

interface State {
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const modes = {
  CLOSED: 'closed',
  CREATING: 'creating',
  RESTORING: 'resizing',
  DEPLOYING: 'cloning',
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
  state = { errors: undefined };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  close = () => {
    this.setState({ errors: undefined });
    this.props.onClose();
  }

  onSubmit = () => {
    const { mode, onSuccess, label, description, imageID } = this.props;

    switch (mode) {
      case modes.EDITING:
        if (!imageID) {
          return;
        }

        if (!label) {
            this.setState({
              errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
            }, () => {
              scrollErrorIntoView();
            });
            return;
        }

        updateImage(imageID, label, description)
          .then(() => {
            this.close();
            onSuccess();
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
      default:
        return;
    }
  }

  render() {
    const { mode, label, description, setLabel, setDescription } = this.props;

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

        <TextField
          label="Label"
          required
          value={label}
          onChange={setLabel}
          error={Boolean(labelError)}
          errorText={labelError}
          data-qa-volume-label
        />

        <TextField
          label="Description"
          required
          multiline
          value={description}
          onChange={setDescription}
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
