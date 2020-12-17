import { APIError } from '@linode/api-v4/lib/types';
import { lensPath, set } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Accordion from 'src/components/Accordion';
import PanelErrorBoundary from 'src/components/PanelErrorBoundary';
import { resetEventsPolling } from 'src/eventsPolling';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import {
  LinodeActionsProps,
  withLinodeActions
} from 'src/store/linodes/linode.containers';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface Props {
  linodeId: number;
  linodeLabel: string;
}

interface State {
  open: boolean;
  errors?: APIError[];
}

type CombinedProps = Props &
  ContextProps &
  LinodeActionsProps &
  RouteComponentProps<{}>;

class LinodeSettingsDeletePanel extends React.Component<CombinedProps, State> {
  state: State = {
    open: false
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
      .catch((error: APIError[]) => {
        this.setState(set(lensPath(['errors']), error), () => {
          scrollErrorIntoView();
        });
      });
  };

  openDeleteDialog = () => {
    this.setState({ open: true });
  };

  closeDeleteDialog = () => {
    this.setState({ open: false });
  };

  render() {
    const { readOnly } = this.props;
    const { errors } = this.state;

    return (
      <React.Fragment>
        <Accordion heading="Delete Linode">
          <Button
            buttonType="primary"
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
        </Accordion>
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
        buttonType="primary"
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
  withLinodeActions
);

export default enhanced(LinodeSettingsDeletePanel) as React.ComponentType<
  Props
>;
