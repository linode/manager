import { lensPath, set } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import TextField from 'src/components/TextField';
import { resetEventsPolling } from 'src/events';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'confirmationCopy';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    confirmationCopy: {
      marginTop: theme.spacing(1)
    }
  });

interface Props {
  linodeId: number;
  linodeLabel: string;
}

interface State {
  open: boolean;
  confirmationText: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props &
  ContextProps &
  LinodeActionsProps &
  RouteComponentProps<{}> &
  WithStyles<ClassNames>;

class LinodeSettingsDeletePanel extends React.Component<CombinedProps, State> {
  state: State = {
    open: false,
    confirmationText: ''
  };

  deleteLinode = () => {
    const {
      linodeActions: { deleteLinode }
    } = this.props;
    this.setState(set(lensPath(['submitting']), true));

    deleteLinode({ linodeId: this.props.linodeId })
      .then(response => {
        resetEventsPolling();
        this.props.history.push('/linodes');
      })
      .catch((error: Linode.ApiFieldError[]) => {
        this.setState(set(lensPath(['errors']), error), () => {
          scrollErrorIntoView();
        });
      });
  };

  openDeleteDialog = () => {
    this.setState({ open: true });
  };

  closeDeleteDialog = () => {
    this.setState({ open: false, confirmationText: '' });
  };

  render() {
    const { readOnly } = this.props;
    const { errors } = this.state;

    return (
      <React.Fragment>
        <ExpansionPanel heading="Delete Linode">
          <Button
            buttonType="secondary"
            destructive
            style={{ marginBottom: 8 }}
            onClick={this.openDeleteDialog}
            data-qa-delete-linode
            disabled={readOnly}
          >
            Delete
          </Button>
          <Typography variant="body1">
            Deleting a Linode will result in permanent data loss.
          </Typography>
        </ExpansionPanel>
        <ConfirmationDialog
          title={`Delete ${this.props.linodeLabel}?`}
          actions={this.renderConfirmationActions}
          open={this.state.open}
          onClose={this.closeDeleteDialog}
          error={errors ? errors[0].reason : undefined}
        >
          <Typography>
            Are you sure you want to delete your Linode? This will result in
            permanent data loss.
          </Typography>
          <Typography className={this.props.classes.confirmationCopy}>
            To confirm deletion, type the name of the Linode (
            {this.props.linodeLabel}) in the field below:
          </Typography>
          <TextField
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              this.setState({ confirmationText: e.target.value })
            }
            expand
          />
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderConfirmationActions = () => (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="cancel"
        onClick={this.closeDeleteDialog}
        data-qa-cancel-delete
      >
        Cancel
      </Button>
      <Button
        disabled={this.state.confirmationText !== this.props.linodeLabel}
        buttonType="secondary"
        destructive
        onClick={this.deleteLinode}
        data-qa-confirm-delete
      >
        Delete
      </Button>
    </ActionsPanel>
  );
}

const errorBoundary = PanelErrorBoundary({ heading: 'Delete Linode' });

interface ContextProps {
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext<ContextProps>(({ linode }) => ({
  readOnly: linode._permissions === 'read_only'
}));

const enhanced = compose<CombinedProps, Props>(
  errorBoundary,
  linodeContext,
  withRouter,
  withLinodeActions,
  withStyles(styles)
);

export default enhanced(LinodeSettingsDeletePanel) as React.ComponentType<
  Props
>;
